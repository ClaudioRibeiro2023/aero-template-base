import type { NextRequest } from 'next/server'
import { ok, tooManyRequests } from '@/lib/api-response'
import { parseBody } from '@/lib/validate'
import { ResetPasswordSchema } from '@/schemas/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { SupabaseDbClient } from '@template/data/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 300_000, max: 3 })
  if (!success) return tooManyRequests()

  const { data, error: parseError } = await parseBody(request, ResetPasswordSchema)
  if (parseError) return parseError

  const db = new SupabaseDbClient()
  const supabase = await db.asUser()

  // Validate APP_URL to prevent redirect to arbitrary domains
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  let validatedBase = ''
  try {
    const parsed = new URL(appUrl)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      validatedBase = parsed.origin
    }
  } catch {
    // Invalid URL — fall back to empty string (relative redirect)
  }
  const redirectTo = `${validatedBase}/auth/callback?next=/login/update-password`
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo })
  if (error) console.error('[auth/reset-password]', error)

  // Always return ok to not leak whether email exists
  return ok({ message: 'If this email exists, you will receive a reset link.' })
}
