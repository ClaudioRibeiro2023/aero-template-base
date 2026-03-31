import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ok, serverError } from '@/lib/api-response'

export const dynamic = 'force-dynamic'

export async function POST() {
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

  const { error } = await supabase.auth.signOut()
  if (error) return serverError(error.message)
  return ok({ message: 'Logged out successfully' })
}
