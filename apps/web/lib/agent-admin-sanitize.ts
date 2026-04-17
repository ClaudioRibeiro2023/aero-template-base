/**
 * agent-admin-sanitize — redacao de campos sensiveis em payloads do agente
 * antes de retornar em endpoints administrativos.
 *
 * Uso: sanitizeJsonPayload(toolLog.input), sanitizeJsonPayload(toolLog.output).
 */

const SENSITIVE_KEY_RE = /password|secret|token|api[_-]?key|apikey|credential|authorization/i
const REDACTED = '[REDACTED]'

export function sanitizeJsonPayload(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (typeof value !== 'object') return value

  if (Array.isArray(value)) {
    return value.map(sanitizeJsonPayload)
  }

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY_RE.test(key)) {
      out[key] = REDACTED
    } else {
      out[key] = sanitizeJsonPayload(val)
    }
  }
  return out
}
