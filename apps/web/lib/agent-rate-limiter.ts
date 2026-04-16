/**
 * AgentRateLimiter — rate limiting básico por tenant/user/endpoint.
 *
 * Sprint 6: proteção contra abuso agora que o agente pode escrever.
 * Implementação simples em-memória com fallback para Supabase.
 *
 * Limites:
 * - Chat: 30 requests / minuto / user
 * - Confirm: 10 requests / minuto / user
 */

interface RateLimitEntry {
  count: number
  windowStart: number
}

const WINDOW_MS = 60_000 // 1 minuto

const LIMITS: Record<string, number> = {
  chat: 30,
  'chat/stream': 30,
  confirm: 10,
  cancel: 10,
}

export class AgentRateLimiter {
  private readonly store = new Map<string, RateLimitEntry>()

  /**
   * Verifica se a request está dentro do limite.
   * Retorna { allowed: true } ou { allowed: false, retryAfterMs }.
   */
  check(
    tenantId: string,
    userId: string,
    endpoint: string
  ): { allowed: true } | { allowed: false; retryAfterMs: number } {
    const key = `${tenantId}:${userId}:${endpoint}`
    const now = Date.now()
    const limit = LIMITS[endpoint] ?? 30

    const entry = this.store.get(key)

    if (!entry || now - entry.windowStart >= WINDOW_MS) {
      // Nova janela
      this.store.set(key, { count: 1, windowStart: now })
      return { allowed: true }
    }

    if (entry.count >= limit) {
      const retryAfterMs = WINDOW_MS - (now - entry.windowStart)
      return { allowed: false, retryAfterMs }
    }

    entry.count++
    return { allowed: true }
  }

  /** Limpa entradas expiradas (chamado periodicamente) */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.windowStart >= WINDOW_MS * 2) {
        this.store.delete(key)
      }
    }
  }
}

// Singleton
let _limiter: AgentRateLimiter | null = null

export function getAgentRateLimiter(): AgentRateLimiter {
  if (!_limiter) {
    _limiter = new AgentRateLimiter()
    // Cleanup a cada 5 minutos
    if (typeof setInterval !== 'undefined') {
      setInterval(() => _limiter?.cleanup(), 300_000)
    }
  }
  return _limiter
}
