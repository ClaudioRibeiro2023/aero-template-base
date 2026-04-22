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

/**
 * Singleton client para leitura client-side.
 *
 * autoRefreshToken=false e detectSessionInUrl=false sao INTENCIONAIS:
 * - O refresh de sessao e feito server-side pelo middleware via @supabase/ssr
 *   (leitura/escrita de cookies httpOnly). Deixar client-side auto-refreshing
 *   gera loop quando ha token residual invalido em /login, /register etc.
 * - detectSessionInUrl=false evita parse desnecessario do hash em rotas que
 *   nao sao callback de OAuth (o /auth/callback usa um client dedicado).
 *
 * SEM bloco `realtime` INTENCIONAL:
 * - Quando `realtime` e configurado, o GoTrueClient instancia um subscriber
 *   interno que escuta onAuthStateChange e chama `setAuth()` em cada evento.
 *   Se houver refresh_token stale no storage, isso dispara cascata:
 *   _callRefreshToken -> _removeSession -> _notifyAllSubscribers ->
 *   _handleTokenChanged -> setAuth -> _performAuth -> _getAccessToken ->
 *   getSession -> loop infinito de 400/429 em /auth/v1/token.
 * - Realtime subscriptions devem ser criadas sob demanda em componentes
 *   especificos via `createClient` dedicado, NAO no singleton compartilhado.
 *
 * Se precisar de fluxo client-side de recuperacao de sessao (ex: signIn no
 * browser seguido de onAuthStateChange), use `createBrowserClient` de
 * `@supabase/ssr` com config dedicada — NAO aumente os defaults aqui.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || 'http://localhost:54321',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

export type { Database }
export { createClient, type SupabaseClient }
