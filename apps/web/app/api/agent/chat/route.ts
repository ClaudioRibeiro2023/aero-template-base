/**
 * POST /api/agent/chat
 *
 * Endpoint do agente conversacional.
 * Sprint 2: persistência real via SupabaseAgentSessionStore.
 *
 * Arquitetura de singletons:
 *   - Infraestrutura stateless (gateway, tools, policy, tracer, packRegistry, memory)
 *     → inicializada uma vez por processo (warm entre requests)
 *   - SupabaseAgentSessionStore → criada por request (precisa de cookies context)
 *   - AgentOrchestrator → criado por request (combina singletons + store per-request)
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  OpenAIGateway,
  MemoryManager,
  ToolRegistry,
  PolicyEngine,
  AgentTracer,
  AgentOrchestrator,
  DomainPackRegistry,
  coreDomainPack,
} from '@template/agent'
import { getAuthGateway } from '@/lib/data'
import { SupabaseAgentSessionStore, isValidTenantId } from '@/lib/agent-session-store'
import { SupabaseMemoryStore } from '@/lib/agent-memory-store'
import { badRequest, unauthorized, serverError } from '@/lib/api-response'

// ─── Schema de entrada ────────────────────────────────────────────────────────

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(10_000),
  sessionId: z.string().uuid().nullable().optional(),
  appId: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// ─── Infraestrutura stateless — singletons por processo ──────────────────────
//
// Estes objetos são stateless entre requests: não guardam cookies,
// não têm referência a usuário específico, podem ser reutilizados com segurança.

const _gateway = new OpenAIGateway()
const _memory = new MemoryManager(_gateway)
const _tools = new ToolRegistry()
const _policy = new PolicyEngine()
const _tracer = new AgentTracer()
const _packRegistry = (() => {
  const r = new DomainPackRegistry()
  r.register(coreDomainPack)
  // TODO Sprint 3: r.register(domainPackEspecífico)
  return r
})()

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Autenticação — usa getAuthGateway() que inclui tenantId
  const { user } = await getAuthGateway().getUser()
  if (!user) return unauthorized()

  // 2. Parse do body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Body inválido')
  }

  const parsed = ChatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map(i => i.message).join(', '))
  }

  const { message, sessionId, metadata } = parsed.data
  const appId = parsed.data.appId ?? 'web'

  // 3. Verificar OPENAI_API_KEY
  if (!process.env.OPENAI_API_KEY) {
    console.error('[AgentChat] OPENAI_API_KEY não configurada')
    return serverError('Serviço de IA não configurado. Configure OPENAI_API_KEY.')
  }

  // 4. Resolver tenantId
  //    Se tenantId for UUID válido → persistência real (Supabase)
  //    Se null ou inválido (ex: demo mode) → sessão efêmera in-memory
  const tenantId = isValidTenantId(user.tenantId) ? user.tenantId : 'default'
  const hasPersistence = isValidTenantId(user.tenantId)

  // 5. Session store por request (precisa de cookies context)
  const sessionStore = hasPersistence ? new SupabaseAgentSessionStore() : undefined

  // 6. Orquestrador por request (combina singletons + store)
  const orchestrator = new AgentOrchestrator({
    gateway: _gateway,
    memory: _memory,
    tools: _tools,
    policy: _policy,
    packRegistry: _packRegistry,
    tracer: _tracer,
    sessionStore,
    memoryStore: hasPersistence ? new SupabaseMemoryStore() : undefined,
  })

  // 7. Executar orquestrador
  try {
    const response = await orchestrator.run({
      message,
      sessionId: sessionId ?? null,
      userId: user.id,
      tenantId,
      appId,
      userRole: (user.role ?? 'VIEWER').toLowerCase(),
      metadata,
    })

    return NextResponse.json({
      ok: true,
      data: {
        content: response.content,
        session: response.session,
        sources: response.sources ?? [],
        toolsUsed: response.toolsUsed ?? [],
        model: response.model,
        tokensUsed: response.tokensUsed,
        latencyMs: response.latencyMs,
        traceId: response.traceId,
        persisted: hasPersistence,
        degraded: response.degraded ?? false,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno do agente'
    console.error('[AgentChat] Erro:', msg)

    if (msg.startsWith('Acesso negado')) {
      return NextResponse.json({ ok: false, error: { message: msg } }, { status: 403 })
    }

    return serverError(msg)
  }
}
