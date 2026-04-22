/**
 * Observability Layer — tracing, métricas e logs do sistema agentic.
 *
 * v2.0: integração com OpenTelemetry (condicional) + persistência Supabase.
 *
 * Estratégia em camadas:
 *   1. Structured log sempre (console.info em JSON)
 *   2. Supabase persistence quando SUPABASE_URL disponível
 *   3. OTEL quando @opentelemetry/api instalado E OTEL_EXPORTER_OTLP_ENDPOINT definido
 *
 * Para habilitar OTEL completo:
 *   npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/exporter-otlp-grpc
 *   OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
 *   OTEL_SERVICE_NAME=my-agent
 */
import { randomUUID } from 'crypto'

// ─── Trace ────────────────────────────────────────────────────────────────────

export interface AgentTrace {
  traceId: string
  sessionId: string
  userId: string
  tenantId: string
  appId: string

  /** Mensagem do usuário (nunca logar dados sensíveis) */
  userMessageLength: number
  /** Tamanho da resposta */
  assistantMessageLength: number

  /** Latência total do turno */
  totalLatencyMs: number
  /** Latência só da IA */
  aiLatencyMs?: number
  /** Latência das tool calls */
  toolsLatencyMs?: number

  /** Tokens consumidos */
  promptTokens: number
  completionTokens: number
  totalTokens: number

  /** Custo estimado em USD */
  estimatedCostUsd: number

  /** Modelo usado */
  model: string

  /** Tools chamadas no turno */
  toolsCalled: string[]

  /** Fontes usadas */
  sourcesUsed: string[]

  /** Camadas de memória consultadas neste turno */
  memoryLayersUsed?: string[]
  /** Documentos recuperados via RAG */
  documentsRetrieved?: number
  /** Indica que o turno operou em modo degradado */
  degraded?: boolean
  /** Razões de degradação */
  degradationReasons?: string[]

  /** Domain pack usado no turno (ex: 'tasks', 'core') */
  domainPack?: string
  /** Estratégia de resolução: 'tenant' | 'app' | 'fallback-core' | 'none' */
  domainPackStrategy?: string

  /** Sucesso do turno */
  success: boolean
  errorCode?: string

  startedAt: string
  completedAt: string
}

// ─── Métricas agregadas ───────────────────────────────────────────────────────

export interface AgentMetrics {
  totalTurns: number
  successfulTurns: number
  failedTurns: number
  totalTokens: number
  totalCostUsd: number
  avgLatencyMs: number
  toolCallRate: number // % de turnos que usaram tool calls
  p95LatencyMs: number
}

// ─── OTEL interface mínima (sem dep hard) ────────────────────────────────────

interface OtelTracer {
  startSpan(name: string, options?: { attributes?: Record<string, unknown> }): OtelSpan
}

interface OtelSpan {
  setAttribute(key: string, value: unknown): void
  setStatus(status: { code: number; message?: string }): void
  end(): void
}

/** Carrega OTEL de forma dinâmica — retorna null se não instalado */
async function loadOtelTracer(serviceName: string): Promise<OtelTracer | null> {
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return null
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { trace } = (await import('@opentelemetry/api' as string as never)) as {
      trace: { getTracer(name: string): OtelTracer }
    }
    return trace.getTracer(serviceName)
  } catch {
    // @opentelemetry/api não instalado — modo silencioso
    return null
  }
}

// ─── Supabase persistence helper ─────────────────────────────────────────────

async function persistToSupabase(trace: AgentTrace): Promise<void> {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key) return

  try {
    await fetch(`${url}/rest/v1/agent_traces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        trace_id: trace.traceId,
        session_id: trace.sessionId,
        user_id: trace.userId,
        tenant_id: trace.tenantId,
        app_id: trace.appId,
        model: trace.model,
        prompt_tokens: trace.promptTokens,
        completion_tokens: trace.completionTokens,
        total_tokens: trace.totalTokens,
        estimated_cost_usd: trace.estimatedCostUsd,
        total_latency_ms: trace.totalLatencyMs,
        ai_latency_ms: trace.aiLatencyMs ?? null,
        tools_latency_ms: trace.toolsLatencyMs ?? null,
        tools_called: trace.toolsCalled,
        sources_used: trace.sourcesUsed,
        memory_layers_used: trace.memoryLayersUsed ?? [],
        documents_retrieved: trace.documentsRetrieved ?? 0,
        domain_pack: trace.domainPack ?? null,
        domain_pack_strategy: trace.domainPackStrategy ?? null,
        degraded: trace.degraded ?? false,
        degradation_reasons: trace.degradationReasons ?? [],
        success: trace.success,
        error_code: trace.errorCode ?? null,
        started_at: trace.startedAt,
        completed_at: trace.completedAt,
      }),
    })
  } catch {
    // Falha silenciosa — observabilidade não pode derrubar o agente
  }
}

// ─── Tracer ───────────────────────────────────────────────────────────────────

export class AgentTracer {
  private readonly traces: AgentTrace[] = []
  private readonly serviceName: string
  private otelTracer: OtelTracer | null = null
  private otelInitialized = false

  constructor(serviceName = process.env.OTEL_SERVICE_NAME ?? 'template-agent') {
    this.serviceName = serviceName
  }

  private async ensureOtel(): Promise<OtelTracer | null> {
    if (!this.otelInitialized) {
      this.otelTracer = await loadOtelTracer(this.serviceName)
      this.otelInitialized = true
    }
    return this.otelTracer
  }

  /** Cria um novo traceId para o turno */
  startTrace(): string {
    return randomUUID()
  }

  /** Finaliza e persiste um trace — async fire-and-forget */
  recordTrace(trace: AgentTrace): void {
    this.traces.push(trace)
    this._emit(trace).catch(() => {
      /* fire-and-forget */
    })
  }

  private async _emit(trace: AgentTrace): Promise<void> {
    // Camada 1 — Structured log (sempre)
    const log = {
      traceId: trace.traceId,
      sessionId: trace.sessionId,
      model: trace.model,
      tokens: trace.totalTokens,
      costUsd: trace.estimatedCostUsd?.toFixed(6),
      latencyMs: trace.totalLatencyMs,
      tools: trace.toolsCalled,
      domainPack: trace.domainPack,
      degraded: trace.degraded,
      success: trace.success,
      errorCode: trace.errorCode,
    }
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[AgentTrace]', JSON.stringify(log))
    } else {
      console.info('[AgentTrace]', JSON.stringify(log))
    }

    // Camada 2 — Supabase persistence (quando env vars presentes)
    await persistToSupabase(trace)

    // Camada 3 — OpenTelemetry (quando instalado + endpoint configurado)
    const otel = await this.ensureOtel()
    if (otel) {
      const span = otel.startSpan('agent.turn', {
        attributes: {
          'agent.session_id': trace.sessionId,
          'agent.user_id': trace.userId,
          'agent.tenant_id': trace.tenantId,
          'agent.model': trace.model,
          'agent.total_tokens': trace.totalTokens,
          'agent.estimated_cost_usd': trace.estimatedCostUsd,
          'agent.latency_ms': trace.totalLatencyMs,
          'agent.tools_called': trace.toolsCalled.join(','),
          'agent.domain_pack': trace.domainPack ?? '',
          'agent.degraded': trace.degraded ?? false,
          'agent.success': trace.success,
        },
      })
      span.setStatus({
        code: trace.success ? 1 : 2, // OK = 1, ERROR = 2
        message: trace.errorCode,
      })
      span.end()
    }
  }

  /** Retorna métricas agregadas */
  getMetrics(): AgentMetrics {
    const total = this.traces.length
    if (total === 0) {
      return {
        totalTurns: 0,
        successfulTurns: 0,
        failedTurns: 0,
        totalTokens: 0,
        totalCostUsd: 0,
        avgLatencyMs: 0,
        toolCallRate: 0,
        p95LatencyMs: 0,
      }
    }

    const successful = this.traces.filter(t => t.success).length
    const totalTokens = this.traces.reduce((s, t) => s + t.totalTokens, 0)
    const totalCostUsd = this.traces.reduce((s, t) => s + (t.estimatedCostUsd ?? 0), 0)
    const latencies = this.traces.map(t => t.totalLatencyMs).sort((a, b) => a - b)
    const avgLatencyMs = latencies.reduce((s, l) => s + l, 0) / total
    const p95LatencyMs = latencies[Math.floor(total * 0.95)] ?? latencies[total - 1] ?? 0
    const withTools = this.traces.filter(t => t.toolsCalled.length > 0).length

    return {
      totalTurns: total,
      successfulTurns: successful,
      failedTurns: total - successful,
      totalTokens,
      totalCostUsd,
      avgLatencyMs: Math.round(avgLatencyMs),
      toolCallRate: Math.round((withTools / total) * 100) / 100,
      p95LatencyMs,
    }
  }

  /** Retorna traces filtrados por sessão */
  getTracesBySession(sessionId: string): AgentTrace[] {
    return this.traces.filter(t => t.sessionId === sessionId)
  }

  /** Retorna os N traces mais recentes */
  getRecentTraces(limit = 100): AgentTrace[] {
    return this.traces.slice(-limit)
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _tracer: AgentTracer | null = null

export function getAgentTracer(): AgentTracer {
  if (!_tracer) _tracer = new AgentTracer()
  return _tracer
}
