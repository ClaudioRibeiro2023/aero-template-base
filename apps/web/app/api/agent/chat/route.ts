/**
 * POST /api/agent/chat
 *
 * Endpoint principal do agente conversacional.
 * Autenticação herdada do template (getAuthUser).
 * Resposta JSON síncrona (streaming via SSE em Sprint 2+).
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
import { getAuthUser } from '@/lib/auth-guard'
import { badRequest, unauthorized, serverError } from '@/lib/api-response'

// ─── Schema de entrada ────────────────────────────────────────────────────────

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(10_000),
  sessionId: z.string().uuid().nullable().optional(),
  appId: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
})

// ─── Singletons por processo (warm entre requisições) ──────────────────────────

function buildOrchestrator(): AgentOrchestrator {
  const gateway = new OpenAIGateway()
  const memory = new MemoryManager(gateway)
  const tools = new ToolRegistry()
  const policy = new PolicyEngine()
  const tracer = new AgentTracer()
  const packRegistry = new DomainPackRegistry()

  // Registra o core pack como fallback
  packRegistry.register(coreDomainPack)

  // TODO Sprint 2: registrar domain packs específicos das aplicações
  // packRegistry.register(financialDomainPack)

  return new AgentOrchestrator({ gateway, memory, tools, policy, packRegistry, tracer })
}

let _orchestrator: AgentOrchestrator | null = null

function getOrchestrator(): AgentOrchestrator {
  if (!_orchestrator) _orchestrator = buildOrchestrator()
  return _orchestrator
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Autenticação
  const { user } = await getAuthUser()
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

  // 3. Verificar se OPENAI_API_KEY está configurada
  if (!process.env.OPENAI_API_KEY) {
    console.error('[AgentChat] OPENAI_API_KEY não configurada')
    return serverError('Serviço de IA não configurado')
  }

  // 4. Executar orquestrador
  try {
    const orchestrator = getOrchestrator()

    const response = await orchestrator.run({
      message,
      sessionId: sessionId ?? null,
      userId: user.id,
      tenantId: 'default', // Sprint 2: extrair do perfil via getAuthGateway()
      appId,
      userRole: user.role ?? 'viewer',
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
