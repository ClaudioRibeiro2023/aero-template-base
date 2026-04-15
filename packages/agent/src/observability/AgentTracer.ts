/**
 * Observability Layer — tracing, métricas e logs do sistema agentic.
 *
 * Sprint 1: implementação em memória + console.
 * Sprint 7: integração com OpenTelemetry + Supabase (agent_traces).
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

// ─── Tracer ───────────────────────────────────────────────────────────────────

export class AgentTracer {
  private readonly traces: AgentTrace[] = []

  /** Cria um novo traceId para o turno */
  startTrace(): string {
    return randomUUID()
  }

  /** Finaliza e persiste um trace */
  recordTrace(trace: AgentTrace): void {
    this.traces.push(trace)

    // Log estruturado (production: enviar para OTEL collector)
    const log = {
      traceId: trace.traceId,
      sessionId: trace.sessionId,
      model: trace.model,
      tokens: trace.totalTokens,
      costUsd: trace.estimatedCostUsd?.toFixed(6),
      latencyMs: trace.totalLatencyMs,
      tools: trace.toolsCalled,
      success: trace.success,
    }

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[AgentTrace]', JSON.stringify(log))
    } else {
      console.info('[AgentTrace]', JSON.stringify(log))
    }

    // TODO Sprint 7: enviar para OTEL e persistir em agent_traces (Supabase)
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
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _tracer: AgentTracer | null = null

export function getAgentTracer(): AgentTracer {
  if (!_tracer) _tracer = new AgentTracer()
  return _tracer
}
