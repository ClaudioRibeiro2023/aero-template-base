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

/**
 * Cliente Supabase para rotas PUBLICAS (/login, /register, /forgot-password).
 *
 * autoRefreshToken=false evita loop de refresh quando o browser tem cookies
 * residuais com refresh token invalido — sintoma observado em producao:
 * 40+ POST /auth/v1/token em um unico load, com 429 rate-limited.
 *
 * persistSession=true mantem a capacidade de signInWithPassword() gravar
 * a sessao; detectSessionInUrl=false evita tentativa de parse quando nao
 * ha hash de OAuth na URL.
 */
export function createSupabasePublicAuthClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  )
}
