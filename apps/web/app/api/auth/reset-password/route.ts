import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ok, badRequest } from '@/lib/api-response'
import { parseBody } from '@/lib/validate'
import { ResetPasswordSchema } from '@/schemas/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 300_000, max: 3 })
  if (!success) return badRequest('Too many reset attempts. Try again later.')

  const { data, error: parseError } = await parseBody(request, ResetPasswordSchema)
  if (parseError) return parseError

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (c: { name: string; value: string; options?: Record<string, unknown> }[]) =>
          c.forEach(({ name, value, options }) => cookieStore.set(name, value, options as never)),
      },
    }
  )

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/auth/callback?next=/login/update-password`
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo })
  if (error) return badRequest(error.message)

  // Always return ok to not leak whether email exists
  return ok({ message: 'If this email exists, you will receive a reset link.' })
}
