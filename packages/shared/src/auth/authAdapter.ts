/**
 * Auth Adapter — Abstract interface for Supabase auth.
 */
import type { AuthContextType } from '@template/types'

export type AuthProvider = 'supabase'

export interface AuthAdapter {
  provider: AuthProvider
  login: (email?: string, password?: string) => Promise<void>
  loginWithOAuth: (provider: string) => Promise<void>
  logout: () => Promise<void>
  getUser: () => Promise<AuthContextType['user'] | null>
  getSession: () => Promise<{ accessToken: string } | null>
  onAuthStateChange: (callback: (user: AuthContextType['user'] | null) => void) => () => void
}

export function getAuthProvider(): AuthProvider {
  return 'supabase'
}
