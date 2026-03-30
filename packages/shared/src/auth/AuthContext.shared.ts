/**
 * Shared Auth Context — used by both SupabaseAuthProvider and DemoAuthProvider.
 * Import useAuth from here for consumer components.
 */
import { createContext, useContext } from 'react'
import type { AuthContextType } from '@template/types'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider (Supabase or Demo)')
  }
  return context
}
