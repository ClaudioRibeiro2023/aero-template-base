/**
 * POST /api/agent/chat/stream
 *
 * Endpoint de streaming SSE do agente conversacional.
 * Sprint 5: mesma lógica do JSON route, mas com resposta incremental.
 *
 * Protocolo SSE:
 *   data: {"type":"delta","content":"..."}       — texto incremental
 *   data: {"type":"tool_start","name":"..."}     — tool call iniciada
 *   data: {"type":"tool_end","name":"...","success":true|false}
 *   data: {"type":"done","content":"...","session":{...},...}  — final
 */
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import {
  OpenAIGateway,
  MemoryManager,
  ToolRegistry,
  PolicyEngine,
  AgentTracer,
  DomainPackRegistry,
  coreDomainPack,
  tasksDomainPack,
  supportDomainPack,
  tasksEnterpriseDomainPack,
  HistoryCompactor,
} from '@template/agent'
import type { AIMessage, ToolExecutionContext } from '@template/agent'
import { DEFAULT_MODEL } from '@template/agent/types/gateway'
import { domainTools } from '@/lib/agent-tools'
import { getAuthGateway } from '@/lib/data'
import { SupabaseAgentSessionStore, isValidTenantId } from '@/lib/agent-session-store'
import { SupabaseMemoryStore } from '@/lib/agent-memory-store'
import { ToolLogPersister } from '@/lib/agent-tool-log-persister'
import { PendingActionStore } from '@/lib/agent-pending-action-store'
import { getAgentRateLimiter } from '@/lib/agent-rate-limiter'

// ─── Schema ──────────────────────────────────────────────────────────────────

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(10_000),
  sessionId: z.string().uuid().nullable().optional(),
  appId: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// ─── Singletons ──────────────────────────────────────────────────────────────

const _gateway = new OpenAIGateway()
const _memory = new MemoryManager(_gateway)
const _tools = (() => {
  const registry = new ToolRegistry()
  registry.registerAll(domainTools)
  return registry
})()
const _toolLogPersister = new ToolLogPersister()
_tools.onLogWritten(log => {
  _toolLogPersister.persist(log).catch(() => {})
})
const _policy = new PolicyEngine()
const _tracer = new AgentTracer()
const _packRegistry = (() => {
  const r = new DomainPackRegistry()
  r.register(coreDomainPack)
  r.register(tasksDomainPack)
  r.register(supportDomainPack)
  // Tenant override — enterprise variation of tasks pack (opt-in via env)
  const enterpriseTenantId = process.env.AGENT_ENTERPRISE_TENANT_ID
  if (enterpriseTenantId) {
    r.registerForTenant(tasksEnterpriseDomainPack, enterpriseTenantId)
  }
  return r
})()

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

const HISTORY_WINDOW = 30
const MAX_TOOL_ROUNDS = 5

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth
  const { user } = await getAuthGateway().getUser()
  if (!user) {
    return new Response(JSON.stringify({ ok: false, error: 'Não autenticado' }), { status: 401 })
  }

  // 2. Parse
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Body inválido' }), { status: 400 })
  }

  const parsed = ChatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ ok: false, error: parsed.error.issues.map(i => i.message).join(', ') }),
      { status: 400 }
    )
  }

  const { message, sessionId, metadata } = parsed.data
  const appId = parsed.data.appId ?? 'web'

  // 3. OpenAI key
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ ok: false, error: 'OPENAI_API_KEY não configurada' }), {
      status: 500,
    })
  }

  // 4. Tenant
  const tenantId = isValidTenantId(user.tenantId) ? user.tenantId : 'default'
  const hasPersistence = isValidTenantId(user.tenantId)
  // Rate limiting
  const rateTenantId = isValidTenantId(user.tenantId) ? user.tenantId : 'default'
  const rateCheck = getAgentRateLimiter().check(rateTenantId, user.id, 'chat/stream')
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ ok: false, error: 'Rate limit excedido' }), {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) },
    })
  }

  const sessionStore = hasPersistence ? new SupabaseAgentSessionStore() : undefined
  const memoryStore = hasPersistence ? new SupabaseMemoryStore() : undefined
  const pendingActionStore = hasPersistence ? new PendingActionStore() : undefined
  const memory = memoryStore ? new MemoryManager(_gateway, memoryStore) : _memory

  // 5. Stream response
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(sseEvent(data)))
      }

      const start = Date.now()
      const traceId = randomUUID()
      const degradationReasons: string[] = []
      const pendingActionsForDone: Array<{
        id: string
        toolName: string
        description: string
        impact: string
        proposedInput: unknown
      }> = []

      try {
        // ─── Resolve domain pack ────────────────────────────────────
        const { pack: domainPack, strategy: packStrategy } = _packRegistry.resolveWithMetadata(
          appId,
          tenantId
        )
        if (!domainPack) {
          send({ type: 'error', error: `Nenhum domain pack para app "${appId}"` })
          controller.close()
          return
        }
        const domainPackFallback =
          packStrategy === 'fallback-core' && appId !== 'core' && appId !== '*'
        if (domainPackFallback) {
          degradationReasons.push('domain-pack-fallback')
        }

        // ─── Policy ─────────────────────────────────────────────────
        const policyDecision = _policy.checkAccess(
          {
            message,
            userId: user.id,
            tenantId,
            appId,
            userRole: (user.role ?? 'VIEWER').toLowerCase(),
          },
          domainPack
        )
        if (!policyDecision.allowed) {
          send({ type: 'error', error: `Acesso negado: ${policyDecision.reason}` })
          controller.close()
          return
        }

        // ─── Session ────────────────────────────────────────────────
        const session = sessionStore
          ? await sessionStore.resolveSession({
              message,
              sessionId: sessionId ?? null,
              userId: user.id,
              tenantId,
              appId,
              userRole: (user.role ?? 'VIEWER').toLowerCase(),
            })
          : {
              id: sessionId ?? randomUUID(),
              userId: user.id,
              tenantId,
              appId,
              status: 'active' as const,
              title: null,
              startedAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
              turnCount: 0,
            }

        const scope = { tenantId, appId, userId: user.id, sessionId: session.id }

        // ─── History ────────────────────────────────────────────────
        let rawHistory: AIMessage[] = []
        if (sessionStore) {
          try {
            rawHistory = await sessionStore.loadHistory(session.id, tenantId, HISTORY_WINDOW)
          } catch {
            degradationReasons.push('falha-historico-persistencia')
          }
        }

        const compactor = new HistoryCompactor(_gateway)
        const history = await compactor.compact(rawHistory).catch(() => {
          degradationReasons.push('falha-compactacao-historico')
          return rawHistory
        })

        // ─── Memory context ─────────────────────────────────────────
        const memoryContext = await memory.getContextForOrchestrator(message, scope)

        // ─── Build system prompt ────────────────────────────────────
        let systemPrompt = domainPack.systemPrompt.systemPrompt
        if (domainPack.systemPrompt.glossary) {
          systemPrompt += `\n\n## Glossário do domínio\n${domainPack.systemPrompt.glossary}`
        }
        if (domainPack.systemPrompt.responseRules?.length) {
          systemPrompt += `\n\n## Regras de resposta\n${domainPack.systemPrompt.responseRules.map((r: string) => `- ${r}`).join('\n')}`
        }
        if (memoryContext.userPreferences.length > 0) {
          systemPrompt += `\n\n## Preferências do usuário\n${memoryContext.userPreferences.map(e => `- ${e.key}: ${JSON.stringify(e.value)}`).join('\n')}`
        }
        if (memoryContext.domainFacts.length > 0) {
          systemPrompt += `\n\n## Fatos do domínio\n${memoryContext.domainFacts.map(e => `- ${e.key}: ${JSON.stringify(e.value)}`).join('\n')}`
        }
        if (memoryContext.documentExcerpts.length > 0) {
          systemPrompt += `\n\n## Documentos relevantes\n${memoryContext.documentExcerpts.map(d => `[${d.source}] ${d.content}`).join('\n\n')}`
        }

        const messages: AIMessage[] = [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: message },
        ]

        // ─── Tools ──────────────────────────────────────────────────
        const toolContext: ToolExecutionContext = {
          userId: user.id,
          tenantId,
          userRole: policyDecision.effectiveRole ?? (user.role ?? 'VIEWER').toLowerCase(),
          appId,
          sessionId: session.id,
          traceId,
        }
        const authorizedToolNames = new Set(domainPack.authorizedSources.internalTools)
        const availableTools = _tools
          .getAvailableTools(toolContext)
          .filter(t => authorizedToolNames.has(t.function.name))

        // ─── Inference loop with streaming ──────────────────────────
        let fullContent = ''
        const toolsUsed: string[] = []
        const sourcesUsed: string[] = []
        let totalTokens = 0
        let totalCostUsd = 0
        const conversationMessages = [...messages]

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          let gotToolCalls = false
          let roundContent = ''

          try {
            const streamGen = _gateway.stream({
              messages: conversationMessages,
              model: DEFAULT_MODEL,
              temperature: 0.3,
              tools: availableTools.length > 0 ? availableTools : undefined,
              traceId,
              sessionId: session.id,
            })

            for await (const chunk of streamGen) {
              if (chunk.type === 'delta' && chunk.delta) {
                roundContent += chunk.delta
                send({ type: 'delta', content: chunk.delta })
              } else if (chunk.type === 'tool_call' && chunk.toolCall) {
                gotToolCalls = true
                const toolName = chunk.toolCall.function.name
                toolsUsed.push(toolName)
                send({ type: 'tool_start', name: toolName })

                // Execute tool
                const toolPolicy = _policy.checkToolAccess(
                  toolName,
                  (user.role ?? 'VIEWER').toLowerCase(),
                  domainPack
                )

                if (!toolPolicy.allowed) {
                  conversationMessages.push({
                    role: 'assistant',
                    content: roundContent,
                    tool_calls: [chunk.toolCall],
                  })
                  conversationMessages.push({
                    role: 'tool',
                    content: JSON.stringify({ error: toolPolicy.reason }),
                    tool_call_id: chunk.toolCall.id,
                  })
                  send({ type: 'tool_end', name: toolName, success: false })
                  continue
                }

                let inputParsed: unknown
                try {
                  inputParsed = JSON.parse(chunk.toolCall.function.arguments)
                } catch {
                  inputParsed = {}
                }

                const result = await _tools.execute(toolName, inputParsed, toolContext)
                if (result.success && result.source) sourcesUsed.push(result.source)

                conversationMessages.push({
                  role: 'assistant',
                  content: roundContent,
                  tool_calls: [chunk.toolCall],
                })
                conversationMessages.push({
                  role: 'tool',
                  content: JSON.stringify(result.success ? result.data : { error: result.error }),
                  tool_call_id: chunk.toolCall.id,
                })
                send({ type: 'tool_end', name: toolName, success: result.success })

                // Check for write tool requiring confirmation (Sprint 6)
                const toolDef = _tools.getDefinition(toolName)
                if (
                  toolDef?.authorization?.requiresConfirmation &&
                  result.success &&
                  (result.data as Record<string, unknown>)?.preview &&
                  pendingActionStore
                ) {
                  const preview = (result.data as Record<string, unknown>).preview as {
                    description: string
                    impact: string
                  }
                  const pending = await pendingActionStore
                    .create({
                      sessionId: session.id,
                      tenantId,
                      userId: user.id,
                      appId,
                      toolName,
                      proposedInput: inputParsed,
                      description: preview.description,
                      impact: preview.impact,
                      traceId,
                    })
                    .catch(() => null)
                  if (pending) {
                    pendingActionsForDone.push({
                      id: pending.id,
                      toolName: pending.toolName,
                      description: pending.description,
                      impact: pending.impact,
                      proposedInput: pending.proposedInput,
                    })
                  }
                }
              } else if (chunk.type === 'done') {
                totalTokens += Math.ceil(roundContent.length / 4)
              }
            }
          } catch {
            // Fallback to non-streaming
            const response = await _gateway.complete({
              messages: conversationMessages,
              model: DEFAULT_MODEL,
              temperature: 0.3,
              tools: availableTools.length > 0 ? availableTools : undefined,
              traceId,
              sessionId: session.id,
            })

            totalTokens += response.usage.totalTokens
            totalCostUsd += response.estimatedCostUsd ?? 0

            if (response.finishReason === 'stop' || !response.toolCalls?.length) {
              roundContent = response.content
              send({ type: 'delta', content: response.content })
            } else {
              // Handle tool calls in non-streaming fallback
              conversationMessages.push({
                role: 'assistant',
                content: response.content,
                tool_calls: response.toolCalls,
              })

              for (const toolCall of response.toolCalls) {
                const toolName = toolCall.function.name
                toolsUsed.push(toolName)
                send({ type: 'tool_start', name: toolName })

                let inputParsed: unknown
                try {
                  inputParsed = JSON.parse(toolCall.function.arguments)
                } catch {
                  inputParsed = {}
                }

                const result = await _tools.execute(toolName, inputParsed, toolContext)
                if (result.success && result.source) sourcesUsed.push(result.source)

                conversationMessages.push({
                  role: 'tool',
                  content: JSON.stringify(result.success ? result.data : { error: result.error }),
                  tool_call_id: toolCall.id,
                })
                send({ type: 'tool_end', name: toolName, success: result.success })

                // Check for write tool requiring confirmation (Sprint 6)
                const toolDef = _tools.getDefinition(toolName)
                if (
                  toolDef?.authorization?.requiresConfirmation &&
                  result.success &&
                  (result.data as Record<string, unknown>)?.preview &&
                  pendingActionStore
                ) {
                  const preview = (result.data as Record<string, unknown>).preview as {
                    description: string
                    impact: string
                  }
                  const pending = await pendingActionStore
                    .create({
                      sessionId: session.id,
                      tenantId,
                      userId: user.id,
                      appId,
                      toolName,
                      proposedInput: inputParsed,
                      description: preview.description,
                      impact: preview.impact,
                      traceId,
                    })
                    .catch(() => null)
                  if (pending) {
                    pendingActionsForDone.push({
                      id: pending.id,
                      toolName: pending.toolName,
                      description: pending.description,
                      impact: pending.impact,
                      proposedInput: pending.proposedInput,
                    })
                  }
                }
              }
              gotToolCalls = true
            }
          }

          if (!gotToolCalls) {
            fullContent = roundContent
            break
          }
        }

        const totalLatencyMs = Date.now() - start

        // ─── Persist messages ───────────────────────────────────────
        if (sessionStore && fullContent) {
          await sessionStore
            .persistMessages({
              sessionId: session.id,
              tenantId,
              userId: user.id,
              userMessage: message,
              assistantMessage: fullContent,
              model: DEFAULT_MODEL,
              tokensUsed: totalTokens,
              latencyMs: totalLatencyMs,
              traceId,
            })
            .catch(err => {
              degradationReasons.push('falha-persistencia-mensagens')
              console.error('[StreamRoute] Erro ao persistir:', err)
            })
        }

        // ─── Touch session ──────────────────────────────────────────
        const updatedTurnCount = session.turnCount + 1
        if (sessionStore) {
          await sessionStore.touchSession(session.id, updatedTurnCount).catch(() => {
            degradationReasons.push('falha-update-sessao')
          })
        }

        // ─── Save metadata to session memory ────────────────────────
        if (metadata) {
          for (const [key, value] of Object.entries(metadata)) {
            await memory.set({
              layer: 'session',
              key,
              value,
              scope,
              ttlSeconds: domainPack.memoryRules?.sessionTtlSeconds ?? 3600,
            })
          }
        }

        // ─── Trace ──────────────────────────────────────────────────
        // domain-pack-fallback é observável mas não conta como degradação real
        const realDegradationReasons = degradationReasons.filter(r => r !== 'domain-pack-fallback')
        const degraded = realDegradationReasons.length > 0
        _tracer.recordTrace({
          traceId,
          sessionId: session.id,
          userId: user.id,
          tenantId,
          appId,
          userMessageLength: message.length,
          assistantMessageLength: fullContent.length,
          totalLatencyMs,
          aiLatencyMs: totalLatencyMs,
          promptTokens: totalTokens,
          completionTokens: 0,
          totalTokens,
          estimatedCostUsd: totalCostUsd,
          model: DEFAULT_MODEL,
          toolsCalled: toolsUsed,
          sourcesUsed,
          memoryLayersUsed: ['session'],
          documentsRetrieved: memoryContext.documentExcerpts.length,
          degraded,
          degradationReasons: degradationReasons.length > 0 ? degradationReasons : undefined,
          domainPack: domainPack.identity.id,
          domainPackStrategy: packStrategy,
          success: true,
          startedAt: new Date(start).toISOString(),
          completedAt: new Date().toISOString(),
        })

        // ─── Done event ─────────────────────────────────────────────
        send({
          type: 'done',
          content: fullContent,
          session: {
            ...session,
            turnCount: updatedTurnCount,
            lastActiveAt: new Date().toISOString(),
          },
          sources: [
            ...sourcesUsed.map(s => ({ type: s, label: s })),
            ...memoryContext.documentExcerpts.map(d => ({
              type: 'document',
              label: d.source,
              detail: `score: ${d.score.toFixed(2)}`,
            })),
          ],
          toolsUsed,
          degraded,
          traceId,
          latencyMs: totalLatencyMs,
          persisted: hasPersistence,
          pendingActions: pendingActionsForDone.length > 0 ? pendingActionsForDone : undefined,
          domainPack: {
            id: domainPack.identity.id,
            version: domainPack.identity.version,
            fallback: domainPackFallback,
          },
        })
      } catch (err) {
        send({
          type: 'error',
          error: err instanceof Error ? err.message : 'Erro interno do agente',
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
