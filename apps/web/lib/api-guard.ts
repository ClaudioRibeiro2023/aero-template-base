import { NextRequest } from 'next/server'

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
