/**
 * Supabase Client — Singleton typed client for the template platform.
 *
 * Usage:
 *   import { supabase } from '@template/shared/supabase'
 *   const { data } = await supabase.from('profiles').select('*')
 *
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    : typeof import.meta !== 'undefined'
      ? (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL || ''
      : ''

const supabaseAnonKey =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    : typeof import.meta !== 'undefined'
      ? (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY ||
        ''
      : ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Run `pnpm run setup` to configure.'
  )
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

export type { Database }
export { createClient, type SupabaseClient }
