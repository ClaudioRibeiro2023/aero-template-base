import type { NextRequest } from 'next/server'
import { ok, badRequest, tooManyRequests, serverError } from '@/lib/api-response'
import { requireJson } from '@/lib/api-guard'
import { parseBody } from '@/lib/validate'
import { SignupSchema } from '@/schemas/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { createSupabaseCookieClient } from '@/lib/supabase-cookies'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 5 })
  if (!success) return tooManyRequests()

  const { data, error: parseError } = await parseBody(request, SignupSchema)
  if (parseError) return parseError

  const supabase = await createSupabaseCookieClient()

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        display_name: data.name,
        tenant_id: data.tenant_id,
      },
    },
  })

  if (error) {
    // Keep user-facing message for duplicate email
    if (error.message.includes('already registered')) {
      return badRequest('Email already registered')
    }
    console.error('[auth/signup]', error)
    return serverError()
  }
  return ok({ user: authData.user?.id, email: authData.user?.email })
}
