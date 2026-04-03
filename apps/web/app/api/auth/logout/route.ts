import { ok, serverError } from '@/lib/api-response'
import { createSupabaseCookieClient } from '@/lib/supabase-cookies'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = createSupabaseCookieClient()

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('[auth/logout]', error)
    return serverError()
  }
  return ok({ message: 'Logged out successfully' })
}
