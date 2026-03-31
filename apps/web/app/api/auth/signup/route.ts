import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ok, badRequest } from '@/lib/api-response'
import { parseBody } from '@/lib/validate'
import { SignupSchema } from '@/schemas/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 5 })
  if (!success) return badRequest('Too many signup attempts. Try again later.')

  const { data, error: parseError } = await parseBody(request, SignupSchema)
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

  if (error) return badRequest(error.message)
  return ok({ user: authData.user?.id, email: authData.user?.email })
}
