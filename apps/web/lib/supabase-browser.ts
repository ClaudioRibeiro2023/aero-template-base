/**
 * Browser-side Supabase client using @supabase/ssr.
 *
 * Stores session in HTTP cookies (not localStorage), ensuring that
 * API routes using createSupabaseCookieClient() can read the session
 * server-side. This is the correct client to use in any 'use client'
 * component that performs auth operations (login, logout, etc).
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@template/shared/supabase'

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
