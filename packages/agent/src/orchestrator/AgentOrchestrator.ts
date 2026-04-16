/**
 * Agent Orchestrator — pipeline de decisão do agente.
 *
 * Fluxo por turno:
 * 1. Resolver Domain Pack
 * 2. Verificar policy (RBAC + escopo)
 * 3. Criar/recuperar sessão (via IAgentSessionStore ou in-memory)
 * 4. Carregar histórico (via IAgentSessionStore ou vazio) + compactar se longo
 * 5. Recuperar contexto de memória (session + user + domain + semantic/RAG)
 * 6. Montar mensagens (system + history + user)
 * 7. Obter tools disponíveis
 * 8. Loop de inferência + tool calls (max 5 rounds)
 * 9. Persistir par de mensagens (user + assistant)
 * 10. Atualizar sessão (turn_count, last_active_at)
 * 11. Gravar fatos de metadados na memória de sessão
 * 12. Registrar trace
 * 13. Retornar resposta consolidada (com sinalização de degradação)
 */
import { randomUUID } from 'crypto'
import type { IAIGateway, AIMessage } from '../types/gateway'
import type { AgentRequest, AgentResponse, AgentContext, AgentSession } from '../types/agent'
import type { IMemoryManager, IExternalMemoryStore, MemoryScope } from '../types/memory'
import type { ToolExecutionContext } from '../types/tool'
import type { IAgentSessionStore } from '../types/session-store'
import { PolicyEngine } from '../policy/PolicyEngine'
import { DomainPackRegistry } from '../domain-packs/DomainPackRegistry'
import { ToolRegistry } from '../tools/ToolRegistry'
import { AgentTracer } from '../observability/AgentTracer'
import { HistoryCompactor } from '../memory/HistoryCompactor'
import { MemoryManager } from '../memory/MemoryManager'
import { DEFAULT_MODEL } from '../types/gateway'

/** Máximo de rounds de tool calls por turno (previne loops infinitos) */
const MAX_TOOL_ROUNDS = 5

/** Janela de histórico injetada no prompt (mensagens anteriores) */
const HISTORY_WINDOW = 30

export interface OrchestratorConfig {
  gateway: IAIGateway
  memory: IMemoryManager
  tools: ToolRegistry
  policy: PolicyEngine
  packRegistry: DomainPackRegistry
  tracer: AgentTracer
  /**
   * Store de persistência de sessões/mensagens.
   * Opcional — se não injetado, a sessão é volátil (in-memory por request).
   */
  sessionStore?: IAgentSessionStore
  /**
   * Store de memória externa (user + domain + semantic).
   * Opcional — se não injetado, apenas session memory disponível.
   */
  memoryStore?: IExternalMemoryStore
}

export class AgentOrchestrator {
  constructor(private readonly config: OrchestratorConfig) {}

  async run(request: AgentRequest): Promise<AgentResponse> {
    const start = Date.now()
    const traceId = randomUUID()
    const degradationReasons: string[] = []

    const { gateway, tools, policy, packRegistry, tracer, sessionStore, memoryStore } = this.config

    // Cria MemoryManager com o externalStore injetado (se disponível)
    const memory: IMemoryManager = memoryStore
      ? new MemoryManager(gateway, memoryStore)
      : this.config.memory

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

    const session = sessionStore
      ? await sessionStore.resolveSession(request)
      : this.resolveSessionInMemory(request)

    const scope: MemoryScope = {
      tenantId: request.tenantId,
      appId: request.appId,
      userId: request.userId,
      sessionId: session.id,
    }

    // ─── 4. Carregar histórico + compactar se longo ───────────────────────────

    let rawHistory: AIMessage[] = []
    if (sessionStore) {
      try {
        rawHistory = await sessionStore.loadHistory(session.id, request.tenantId, HISTORY_WINDOW)
      } catch {
        degradationReasons.push('falha-historico-persistencia')
      }
    }

    const compactor = new HistoryCompactor(gateway)
    const history = await compactor.compact(rawHistory).catch(() => {
      degradationReasons.push('falha-compactacao-historico')
      return rawHistory
    })

    // ─── 5. Recuperar contexto de memória ─────────────────────────────────────

    const memoryContext = await memory.getContextForOrchestrator(request.message, scope)

    // Coleta camadas efetivamente usadas
    const memoryLayersUsed: string[] = ['session']
    if (memoryContext.userPreferences.length > 0) memoryLayersUsed.push('user')
    if (memoryContext.domainFacts.length > 0) memoryLayersUsed.push('domain')
    if (memoryContext.documentExcerpts.length > 0) memoryLayersUsed.push('semantic')

    // ─── 6. Montar mensagens ──────────────────────────────────────────────────

    const systemPrompt = this.buildSystemPrompt(domainPack, memoryContext)
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: request.message },
    ]

    // ─── 7. Obter tools disponíveis ───────────────────────────────────────────

    const toolContext: ToolExecutionContext = {
      userId: request.userId,
      tenantId: request.tenantId,
      userRole: policyDecision.effectiveRole ?? request.userRole,
      appId: request.appId,
      sessionId: session.id,
      traceId,
    }
    const availableTools = tools.getAvailableTools(toolContext)

    // ─── 8. Loop de inferência + tool calls ───────────────────────────────────

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
        model: DEFAULT_MODEL,
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

    const totalLatencyMs = Date.now() - start

    // ─── 9. Persistir mensagens ───────────────────────────────────────────────

    if (sessionStore && finalContent) {
      await sessionStore
        .persistMessages({
          sessionId: session.id,
          tenantId: request.tenantId,
          userId: request.userId,
          userMessage: request.message,
          assistantMessage: finalContent,
          model: DEFAULT_MODEL,
          tokensUsed: totalTokens,
          latencyMs: totalLatencyMs,
          traceId,
        })
        .catch(err => {
          degradationReasons.push('falha-persistencia-mensagens')
          console.error('[AgentOrchestrator] Erro ao persistir mensagens:', err)
        })
    }

    // ─── 10. Atualizar sessão ─────────────────────────────────────────────────

    const updatedTurnCount = session.turnCount + 1

    if (sessionStore) {
      await sessionStore.touchSession(session.id, updatedTurnCount).catch(err => {
        degradationReasons.push('falha-update-sessao')
        console.error('[AgentOrchestrator] Erro ao atualizar sessão:', err)
      })
    }

    // ─── 11. Gravar fatos de metadados na memória de sessão ───────────────────

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

    // ─── 12. Registrar trace ──────────────────────────────────────────────────

    const degraded = degradationReasons.length > 0

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
      memoryLayersUsed,
      documentsRetrieved: memoryContext.documentExcerpts.length,
      degraded,
      degradationReasons: degraded ? degradationReasons : undefined,
      success: true,
      startedAt: new Date(start).toISOString(),
      completedAt: new Date().toISOString(),
    })

    // ─── 13. Retornar resposta ────────────────────────────────────────────────

    return {
      content: finalContent,
      session: {
        ...session,
        turnCount: updatedTurnCount,
        lastActiveAt: new Date().toISOString(),
      },
      sources: [
        ...sourcesUsed.map(s => ({ type: s as never, label: s })),
        ...memoryContext.documentExcerpts.map(d => ({
          type: 'document' as const,
          label: d.source,
          detail: `score: ${d.score.toFixed(2)}`,
        })),
      ],
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
      model: DEFAULT_MODEL,
      tokensUsed: totalTokens,
      latencyMs: totalLatencyMs,
      traceId,
      degraded: degraded || undefined,
      degradationReasons: degraded ? degradationReasons : undefined,
    }
  }

  // ─── privados ──────────────────────────────────────────────────────────────

  /** Fallback in-memory quando sessionStore não está injetado (demo/dev) */
  private resolveSessionInMemory(request: AgentRequest): AgentSession {
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
    memoryContext: AgentContext['memoryContext']
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

    // Sprint 3: injetar memória relevante
    if (memoryContext.userPreferences.length > 0) {
      const prefs = memoryContext.userPreferences
        .map(e => `- ${e.key}: ${JSON.stringify(e.value)}`)
        .join('\n')
      prompt += `\n\n## Preferências do usuário\n${prefs}`
    }

    if (memoryContext.domainFacts.length > 0) {
      const facts = memoryContext.domainFacts
        .map(e => `- ${e.key}: ${JSON.stringify(e.value)}`)
        .join('\n')
      prompt += `\n\n## Fatos do domínio\n${facts}`
    }

    if (memoryContext.documentExcerpts.length > 0) {
      const excerpts = memoryContext.documentExcerpts
        .map(d => `[${d.source}] ${d.content}`)
        .join('\n\n')
      prompt += `\n\n## Documentos relevantes\n${excerpts}`
    }

    return prompt
  }
}
