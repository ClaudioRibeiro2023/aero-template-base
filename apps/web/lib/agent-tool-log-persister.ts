/**
 * ToolLogPersister — persiste logs de execução de tools no Supabase.
 *
 * Sprint 5: Bloco A — persistência real em agent_tool_logs.
 * Nunca lança exceção (não pode quebrar a resposta do usuário).
 */
import { SupabaseDbClient } from '@template/data/supabase'
import type { ToolExecutionLog } from '@template/agent'

/** Sanitize input: remove campos sensíveis */
function sanitizePayload(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data
  const sensitivePattern = /password|secret|token|api_key|apikey|credential/i
  const obj = data as Record<string, unknown>
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (sensitivePattern.test(key)) {
      result[key] = '[REDACTED]'
    } else {
      result[key] = value
    }
  }
  return result
}

/** Trunca output a 10KB se necessário */
function truncateOutput(data: unknown): unknown {
  if (!data) return null
  const json = JSON.stringify(data)
  if (json.length <= 10_240) return data
  return { _truncated: true, preview: json.slice(0, 10_240) }
}

export class ToolLogPersister {
  async persist(log: ToolExecutionLog, userRole?: string, appId?: string): Promise<void> {
    try {
      const db = new SupabaseDbClient()
      const client = await db.asUser()

      const { error } = await client.from('agent_tool_logs').insert({
        id: log.id,
        trace_id: log.traceId,
        session_id: log.sessionId || null,
        tenant_id: log.tenantId,
        user_id: log.userId,
        tool_name: log.toolName,
        input: sanitizePayload(log.input),
        output: truncateOutput(log.output),
        success: log.success,
        error_msg: log.errorMessage ?? null,
        latency_ms: log.durationMs,
        user_role: userRole ?? null,
        app_id: appId ?? log.appId ?? null,
        created_at: log.executedAt,
      })

      if (error) {
        console.error('[ToolLogPersister] Erro ao persistir log:', error.message)
      }
    } catch (err) {
      console.error('[ToolLogPersister] Erro fatal:', err instanceof Error ? err.message : err)
    }
  }
}
