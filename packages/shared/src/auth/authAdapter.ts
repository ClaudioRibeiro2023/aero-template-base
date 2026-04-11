/**
 * Auth Adapter — Interface de autenticação client-side agnóstica a provider.
 *
 * v3.0: getAuthProvider() lê AUTH_PROVIDER env var (default: 'supabase').
 * Para adicionar NextAuth: setar AUTH_PROVIDER=nextauth e registrar o adapter.
 */
import type { AuthContextType } from '@template/types'

export type AuthProvider = 'supabase' | 'demo' | string

export interface AuthAdapter {
  provider: AuthProvider
  login: (email?: string, password?: string) => Promise<void>
  loginWithOAuth: (provider: string) => Promise<void>
  logout: () => Promise<void>
  getUser: () => Promise<AuthContextType['user'] | null>
  getSession: () => Promise<{ accessToken: string } | null>
  onAuthStateChange: (callback: (user: AuthContextType['user'] | null) => void) => () => void
}

/**
 * Retorna o nome do provider de auth configurado.
 * Lê process.env.AUTH_PROVIDER — default 'supabase'.
 * Funciona em runtime (client-side: via NEXT_PUBLIC_, server-side: direto).
 */
export function getAuthProvider(): AuthProvider {
  // Client-side: usa NEXT_PUBLIC_AUTH_PROVIDER se definido
  // Server-side: usa AUTH_PROVIDER diretamente
  return (
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_PROVIDER) ||
    (typeof process !== 'undefined' && process.env.AUTH_PROVIDER) ||
    'supabase'
  )
}
