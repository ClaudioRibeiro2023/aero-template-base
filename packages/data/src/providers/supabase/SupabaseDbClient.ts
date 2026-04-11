/**
 * SupabaseDbClient — Implementação do IServerDbClient para Supabase.
 *
 * Encapsula a criação de clientes Supabase (admin e cookie-based)
 * atrás da interface genérica IServerDbClient.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import type { IServerDbClient } from '../../interfaces/IDbClient'

export class SupabaseDbClient implements IServerDbClient {
  readonly provider = 'supabase' as const

  /**
   * Cliente com service role key (bypassa RLS).
   * Uso: criação de usuários, operações admin.
   */
  asAdmin(): SupabaseClient {
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
   * Cliente cookie-based (respeita RLS do usuário autenticado).
   * Uso: operações normais em API routes.
   *
   * Requer next/headers — só funciona em contexto de request.
   */
  async asUser(): Promise<SupabaseClient> {
    // Dynamic import para evitar erro em contextos não-Next.js
    const { cookies } = await import('next/headers')
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
            // Ignorar erros em contextos read-only
          }
        })
      },
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    return createServerClient(url, key, { cookies: cookieMethods })
  }
}
