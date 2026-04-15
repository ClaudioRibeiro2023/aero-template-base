/**
 * Agent Orchestrator — pipeline de decisão do agente.
 *
 * Fluxo por turno:
 * 1. Verificar policy (RBAC + escopo)
 * 2. Resolver Domain Pack
 * 3. Recuperar contexto de memória
 * 4. Montar prompt com contexto enxuto
 * 5. Chamar AI Gateway
 * 6. Executar tool calls (se houver) — loop até stop
 * 7. Gravar fatos na memória de sessão
 * 8. Registrar trace
 * 9. Retornar resposta consolidada
 */
import { randomUUID } from 'crypto'
import type { IAIGateway, AIMessage } from '../types/gateway'
import type { AgentRequest, AgentResponse, AgentContext, AgentSession } from '../types/agent'
import type { IMemoryManager, MemoryScope } from '../types/memory'
import type { ToolExecutionContext } from '../types/tool'
import { PolicyEngine } from '../policy/PolicyEngine'
import { DomainPackRegistry } from '../domain-packs/DomainPackRegistry'
import { ToolRegistry } from '../tools/ToolRegistry'
import { AgentTracer } from '../observability/AgentTracer'
import { DEFAULT_MODEL } from '../types/gateway'

const MAX_TOOL_ROUNDS = 5 // máximo de rounds de tool calls por turno

export interface OrchestratorConfig {
  gateway: IAIGateway
  memory: IMemoryManager
  tools: ToolRegistry
  policy: PolicyEngine
  packRegistry: DomainPackRegistry
  tracer: AgentTracer
}

export class AgentOrchestrator {
  constructor(private readonly config: OrchestratorConfig) {}

  async run(request: AgentRequest): Promise<AgentResponse> {
    const start = Date.now()
    const traceId = randomUUID()

    const { gateway, memory, tools, policy, packRegistry, tracer } = this.config

    // ─── 1. Resolver domain pack ──────────────────────────────────────────────

    const domainPack = packRegistry.resolve(request.appId, request.tenantId)
    if (!domainPack) {
      throw new Error(`Nenhum domain pack encontrado para app "${request.appId}"`)
    }

    // ─── 2. Verificar policy ──────────────────────────────────────────────────

    const policyDecision = policy.checkAccess(request, domainPack)
    if (!policyDecision.allowed) {
      throw new Error(`Acesso negado: ${policyDecision.reason}`)
    }

    // ─── 3. Criar/recuperar sessão ────────────────────────────────────────────

    const session = await this.resolveSession(request)
    const scope: MemoryScope = {
      tenantId: request.tenantId,
      appId: request.appId,
      userId: request.userId,
      sessionId: session.id,
    }

    // ─── 4. Recuperar contexto de memória ─────────────────────────────────────

    const memoryContext = await memory.getContextForOrchestrator(request.message, scope)

    // ─── 5. Montar mensagens ──────────────────────────────────────────────────

    const systemPrompt = this.buildSystemPrompt(domainPack, memoryContext)
    const history = this.buildHistory(session)
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: request.message },
    ]

    // ─── 6. Obter tools disponíveis ───────────────────────────────────────────

    const toolContext: ToolExecutionContext = {
      userId: request.userId,
      tenantId: request.tenantId,
      userRole: policyDecision.effectiveRole ?? request.userRole,
      appId: request.appId,
      sessionId: session.id,
      traceId,
    }
    const availableTools = tools.getAvailableTools(toolContext)

    // ─── 7. Loop de inferência + tool calls ──────────────────────────────────

    let finalContent = ''
    const toolsUsed: string[] = []
    const sourcesUsed: string[] = []
    let aiLatencyMs = 0
    let totalTokens = 0
    let totalCostUsd = 0

    const conversationMessages = [...messages]

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const aiCallStart = Date.now()
      const response = await gateway.complete({
        messages: conversationMessages,
        model: domainPack.identity.id === 'core' ? DEFAULT_MODEL : DEFAULT_MODEL,
        temperature: 0.3,
        tools: availableTools.length > 0 ? availableTools : undefined,
        traceId,
        sessionId: session.id,
      })

      aiLatencyMs += Date.now() - aiCallStart
      totalTokens += response.usage.totalTokens
      totalCostUsd += response.estimatedCostUsd ?? 0

      if (response.finishReason === 'stop' || !response.toolCalls?.length) {
        finalContent = response.content
        break
      }

      // Executa tool calls
      conversationMessages.push({
        role: 'assistant',
        content: response.content,
        tool_calls: response.toolCalls,
      })

      for (const toolCall of response.toolCalls) {
        const toolName = toolCall.function.name
        toolsUsed.push(toolName)

        // Verifica policy antes de executar
        const toolPolicy = policy.checkToolAccess(toolName, request.userRole, domainPack)
        if (!toolPolicy.allowed) {
          conversationMessages.push({
            role: 'tool',
            content: JSON.stringify({ error: toolPolicy.reason }),
            tool_call_id: toolCall.id,
          })
          continue
        }

        let inputParsed: unknown
        try {
          inputParsed = JSON.parse(toolCall.function.arguments)
        } catch {
          inputParsed = {}
        }

        const result = await tools.execute(toolName, inputParsed, toolContext)

        if (result.success && result.source) {
          sourcesUsed.push(result.source)
        }

        conversationMessages.push({
          role: 'tool',
          content: JSON.stringify(result.success ? result.data : { error: result.error }),
          tool_call_id: toolCall.id,
        })
      }
    }

    // ─── 8. Gravar fatos de sessão ────────────────────────────────────────────

    if (request.metadata) {
      for (const [key, value] of Object.entries(request.metadata)) {
        await memory.set({
          layer: 'session',
          key,
          value,
          scope,
          ttlSeconds: domainPack.memoryRules?.sessionTtlSeconds ?? 3600,
        })
      }
    }

    // ─── 9. Registrar trace ───────────────────────────────────────────────────

    const totalLatencyMs = Date.now() - start
    tracer.recordTrace({
      traceId,
      sessionId: session.id,
      userId: request.userId,
      tenantId: request.tenantId,
      appId: request.appId,
      userMessageLength: request.message.length,
      assistantMessageLength: finalContent.length,
      totalLatencyMs,
      aiLatencyMs,
      promptTokens: totalTokens,
      completionTokens: 0,
      totalTokens,
      estimatedCostUsd: totalCostUsd,
      model: DEFAULT_MODEL,
      toolsCalled: toolsUsed,
      sourcesUsed,
      success: true,
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
    })

    // ─── 10. Retornar resposta ────────────────────────────────────────────────

    return {
      content: finalContent,
      session: {
        ...session,
        turnCount: session.turnCount + 1,
        lastActiveAt: new Date().toISOString(),
      },
      sources: sourcesUsed.map(s => ({ type: s as never, label: s })),
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
      model: DEFAULT_MODEL,
      tokensUsed: totalTokens,
      latencyMs: totalLatencyMs,
      traceId,
    }
  }

  // ─── privados ──────────────────────────────────────────────────────────────

  private async resolveSession(request: AgentRequest): Promise<AgentSession> {
    // Sprint 2: recuperar sessão do Supabase por request.sessionId
    // Sprint 1: sessão em memória
    const now = new Date().toISOString()
    return {
      id: request.sessionId ?? randomUUID(),
      userId: request.userId,
      tenantId: request.tenantId,
      appId: request.appId,
      status: 'active',
      title: null,
      startedAt: now,
      lastActiveAt: now,
      turnCount: 0,
    }
  }

  private buildSystemPrompt(
    pack: ReturnType<DomainPackRegistry['resolve']>,
    _memoryContext: AgentContext['memoryContext']
  ): string {
    if (!pack) return ''
    const { systemPrompt } = pack

    let prompt = systemPrompt.systemPrompt

    if (systemPrompt.glossary) {
      prompt += `\n\n## Glossário do domínio\n${systemPrompt.glossary}`
    }

    if (systemPrompt.responseRules?.length) {
      prompt += `\n\n## Regras de resposta\n${systemPrompt.responseRules.map(r => `- ${r}`).join('\n')}`
    }

    // TODO Sprint 3: injetar memória relevante no prompt
    // TODO Sprint 4: injetar excerpts de documentos

    return prompt
  }

  private buildHistory(_session: AgentSession): AIMessage[] {
    // Sprint 2: buscar histórico do Supabase (limitado a N mensagens)
    // Sprint 1: sem histórico persistido
    return []
  }
}
