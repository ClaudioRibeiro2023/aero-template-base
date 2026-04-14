import { NextRequest, NextResponse } from 'next/server'
import { badRequest, forbidden } from '@/lib/api-response'

/**
 * CSRF Strategy
 * =============
 * This template uses a layered CSRF defense:
 *
 * 1. **SameSite=Lax cookies** (Supabase default) — browser refuses to send auth
 *    cookies on cross-origin POST/PUT/DELETE requests.
 *
 * 2. **Origin validation** (`validateApiRequest`) — checks that the Origin header
 *    matches the Host header. Applied via `withCsrf()` wrapper.
 *
 * 3. **Content-Type enforcement** (`requireJson`) — rejects non-JSON payloads,
 *    preventing simple form-based CSRF attacks.
 *
 * For apps that need stricter protection (e.g., financial transactions), wrap
 * mutation handlers with `withCsrf()`:
 *
 *   export const POST = withCsrf(async (req) => { ... })
 *
 * The combination of SameSite cookies + server-side auth middleware provides
 * adequate CSRF protection for most use cases without the `withCsrf` wrapper.
 * See: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

/**
 * Validates that API requests originate from the same host (CSRF-like protection).
 * Returns true if the request is valid (same-origin or server-side call without origin).
 */
export function validateApiRequest(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (!origin || !host) return true // Allow server-side calls
  const originHost = new URL(origin).host
  return originHost === host
}

/**
 * Validates Content-Type is application/json for mutation endpoints.
 * Returns null if valid, or a 400 Response if invalid.
 */
export function requireJson(req: NextRequest) {
  const ct = req.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    return badRequest('Content-Type must be application/json')
  }
  return null
}

/**
 * Wrapper that applies CSRF validation to mutation handlers.
 * Use: export const POST = withCsrf(async (req) => { ... })
 */
export function withCsrf(handler: (req: NextRequest, ctx?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, ctx?: any) => {
    if (!validateApiRequest(req)) {
      return forbidden('Requisição de origem inválida')
    }
    return handler(req, ctx)
  }
}
