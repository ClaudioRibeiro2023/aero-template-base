import { ok, serverError } from '@/lib/api-response'
import { SupabaseDbClient } from '@template/data/supabase'

export const dynamic = 'force-dynamic'

export async function POST() {
  const db = new SupabaseDbClient()
  const supabase = await db.asUser()

  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('[auth/logout]', error)
    return serverError()
  }
  return ok({ message: 'Logged out successfully' })
}
