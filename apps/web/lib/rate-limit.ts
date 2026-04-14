/**
 * Pluggable rate limiter for API routes.
 *
 * Strategy auto-selection:
 * - If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set → Upstash Redis
 * - Otherwise → in-memory (default, suitable for single-instance)
 *
 * Public API is unchanged — `rateLimit()` signature is stable.
 */

// ─── Interface ──────────────────────────────────────────────────────────────

export interface RateLimitConfig {
  windowMs?: number // Time window in ms (default: 60000 = 1 min)
  max?: number // Max requests per window (default: 10)
}

export interface RateLimitResult {
  success: boolean
  remaining: number
}

interface IRateLimiter {
  check(key: string, config: RateLimitConfig): Promise<RateLimitResult>
}

// ─── In-Memory implementation (default) ─────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

class InMemoryRateLimiter implements IRateLimiter {
  async check(key: string, config: RateLimitConfig = {}): Promise<RateLimitResult> {
    const { windowMs = 60_000, max = 10 } = config
    const now = Date.now()
    const entry = rateLimitMap.get(key)

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
      return { success: true, remaining: max - 1 }
    }

    if (entry.count >= max) {
      return { success: false, remaining: 0 }
    }

    entry.count++
    return { success: true, remaining: max - entry.count }
  }
}

// Periodic cleanup of expired entries (every 5 min)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetTime) rateLimitMap.delete(key)
    }
  }, 300_000)
}

// ─── Upstash Redis implementation (optional) ────────────────────────────────

class UpstashRateLimiter implements IRateLimiter {
  private url: string
  private token: string

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
  }

  async check(key: string, config: RateLimitConfig = {}): Promise<RateLimitResult> {
    const { windowMs = 60_000, max = 10 } = config
    const windowSec = Math.ceil(windowMs / 1000)
    const redisKey = `rl:${key}`

    try {
      // INCR + EXPIRE via Upstash REST API (pipeline)
      const res = await fetch(`${this.url}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', redisKey],
          ['EXPIRE', redisKey, windowSec.toString()],
        ]),
      })

      if (!res.ok) {
        // Fallback to allow on Redis failure (fail-open)
        console.warn('[rate-limit] Upstash request failed, allowing request')
        return { success: true, remaining: max }
      }

      const data = (await res.json()) as Array<{ result: number }>
      const count = data[0]?.result ?? 1

      return {
        success: count <= max,
        remaining: Math.max(0, max - count),
      }
    } catch (err) {
      // Fail-open: if Redis is unreachable, allow the request
      console.warn('[rate-limit] Upstash error, failing open:', err)
      return { success: true, remaining: max }
    }
  }
}

// ─── Factory: auto-select strategy ──────────────────────────────────────────

function createLimiter(): IRateLimiter {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    return new UpstashRateLimiter(url, token)
  }

  return new InMemoryRateLimiter()
}

const limiter = createLimiter()

// ─── Public API (unchanged signature) ───────────────────────────────────────

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  return limiter.check(identifier, config)
}

/**
 * Get client IP from request headers (for rate limiting key).
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Rate limit by authenticated user ID, falling back to IP when unauthenticated.
 * Provides more accurate per-user limiting regardless of IP changes/shared IPs.
 */
export function rateLimitByUser(
  userId: string | undefined,
  ip: string,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  const identifier = userId ? `user:${userId}` : `ip:${ip}`
  return rateLimit(identifier, config)
}

/**
 * Extract the authenticated user ID from request headers.
 * Reads the x-user-id header set by middleware after auth validation.
 */
export function getUserIdFromHeaders(headers: Headers): string | undefined {
  return headers.get('x-user-id') ?? undefined
}
