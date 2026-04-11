import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a cookie-based Supabase client for API routes (async, Next.js 15+).
 *
 * @deprecated v3.0: Use `new SupabaseDbClient().asUser()` de `@template/data/supabase`.
 * Este arquivo será removido no Sprint 7 (cleanup).
 */
export async function createSupabaseCookieClient() {
  const cookieStore = await cookies()

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        try {
          cookieStore.set(name, value, options)
        } catch {
          // Ignorar erros em contextos read-only (ex: Server Components sem mutação)
        }
      })
    },
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  )
}
