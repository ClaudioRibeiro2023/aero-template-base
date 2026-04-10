import { NextRequest } from 'next/server'
import { badRequest } from '@/lib/api-response'

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
