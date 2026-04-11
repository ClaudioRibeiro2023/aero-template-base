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
): { success: boolean; remaining: number } {
  // If userId available, rate limit per userId (more precise)
  // If not, fallback to IP
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

// Periodic cleanup of expired entries (every 5 min)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetTime) rateLimitMap.delete(key)
    }
  }, 300_000)
}
