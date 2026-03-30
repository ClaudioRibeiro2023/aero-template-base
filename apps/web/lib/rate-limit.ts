/**
 * Simple in-memory rate limiter for API routes.
 * For production with multiple instances, use Redis-based (e.g., @upstash/ratelimit).
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs?: number // Time window in ms (default: 60000 = 1 min)
  max?: number // Max requests per window (default: 10)
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): { success: boolean; remaining: number } {
  const { windowMs = 60_000, max = 10 } = config
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: max - 1 }
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: max - entry.count }
}

/**
 * Get client IP from request headers (for rate limiting key).
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown'
  )
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
