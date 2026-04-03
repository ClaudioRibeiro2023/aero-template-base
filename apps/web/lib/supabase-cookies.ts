import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a cookie-based Supabase client for API routes (async, Next.js 15+).
 * Uses the anon key + cookie auth (respects RLS per-user).
 *
 * Centraliza o cookie adapter — nenhuma route precisa repetir esse boilerplate.
 *
 * Nota: o generic <Database> não é passado porque o tipo manual (não gerado por
 * `supabase gen types`) não inclui __InternalSupabase, tornando as queries `never`.
 * Ao migrar para tipos gerados automaticamente, adicionar <Database> aqui.
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
