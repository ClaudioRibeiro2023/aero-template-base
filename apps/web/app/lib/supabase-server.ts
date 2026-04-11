import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with service role key for server-side operations.
 *
 * @deprecated v3.0: Use `new SupabaseDbClient().asAdmin()` de `@template/data/supabase`.
 * Este arquivo será removido no Sprint 7 (cleanup).
 */
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Creates a Supabase client with anon key for verifying user tokens.
 *
 * @deprecated v3.0: Use `new SupabaseDbClient().asUser()` de `@template/data/supabase`.
 */
export function createAnonSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
