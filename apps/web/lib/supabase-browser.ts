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
 * Apaga cookies sb-*-auth-token no browser.
 *
 * Chamar ANTES de instanciar um cliente @supabase/ssr em rota publica de
 * auth. Motivo: `@supabase/ssr` hardcoda `autoRefreshToken: isBrowser()`
 * no bundle e ignora o override `auth.autoRefreshToken: false`. Se houver
 * cookie `sb-*-auth-token` com refresh_token stale, o GoTrueClient
 * dispara cascata infinita de POST /auth/v1/token (observado em prod:
 * 231 requests 400/429 em um unico load).
 *
 * Em /login, /register etc. NUNCA deve haver sessao valida (middleware
 * redireciona sessao ativa pra /dashboard antes de chegar aqui), logo
 * apagar o cookie e sempre seguro.
 */
export function clearStaleAuthCookies() {
  if (typeof document === 'undefined') return
  const names = document.cookie
    .split(';')
    .map(c => c.trim().split('=')[0])
    .filter(n => n.startsWith('sb-') && n.includes('-auth-token'))
  for (const name of names) {
    // Expirar em todos os paths plausiveis
    document.cookie = `${name}=; path=/; Max-Age=0; SameSite=Lax`
    document.cookie = `${name}=; path=/; Max-Age=0; SameSite=Lax; Secure`
  }
}

/**
 * Cliente Supabase para rotas PUBLICAS (/login, /register, /forgot-password).
 *
 * Invoca `clearStaleAuthCookies()` no boot para garantir que o cliente
 * nao leia refresh_token stale (ver JSDoc de `clearStaleAuthCookies`).
 *
 * persistSession=true mantem a capacidade de signInWithPassword() gravar
 * a sessao; detectSessionInUrl=false evita tentativa de parse quando nao
 * ha hash de OAuth na URL.
 */
export function createSupabasePublicAuthClient() {
  clearStaleAuthCookies()
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
