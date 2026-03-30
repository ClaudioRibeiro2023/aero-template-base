/**
 * Auth Adapter — Abstract interface for dual auth support.
 *
 * Supports Supabase Auth (default) and Keycloak OIDC (optional).
 * Selected via NEXT_PUBLIC_AUTH_PROVIDER env var.
 */
import type { AuthContextType } from '@template/types'

export type AuthProvider = 'supabase' | 'keycloak'

export interface AuthAdapter {
  provider: AuthProvider
  login: (email?: string, password?: string) => Promise<void>
  loginWithOAuth: (provider: string) => Promise<void>
  logout: () => Promise<void>
  getUser: () => Promise<AuthContextType['user'] | null>
  getSession: () => Promise<{ accessToken: string } | null>
  onAuthStateChange: (callback: (user: AuthContextType['user'] | null) => void) => () => void
}

const env =
  typeof process !== 'undefined'
    ? process.env
    : typeof import.meta !== 'undefined'
      ? ((import.meta as unknown as { env?: Record<string, string> }).env ?? {})
      : {}

export function getAuthProvider(): AuthProvider {
  const provider = (env.NEXT_PUBLIC_AUTH_PROVIDER ||
    env.VITE_AUTH_PROVIDER ||
    'supabase') as AuthProvider
  return provider === 'keycloak' ? 'keycloak' : 'supabase'
}
