'use client'

/**
 * Demo Auth Provider — Provides a mock authenticated user for development/testing.
 * Activated when NEXT_PUBLIC_DEMO_MODE=true or VITE_DEMO_MODE=true.
 */
import { useState, useCallback, type ReactNode } from 'react'
import type { AuthContextType, AuthUser } from '@template/types'
import { AuthContext } from './AuthContext.shared'

const DEMO_USER: AuthUser = {
  id: 'demo-user-001',
  email: 'admin@template.dev',
  name: 'Admin Demo',
  roles: ['ADMIN'],
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEMO_USER)

  const login = useCallback(async () => {
    setUser(DEMO_USER)
    console.log('[DemoAuth] Login simulado')
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    // Small delay to let state propagate before redirect
    setTimeout(() => {
      window.location.href = '/login'
    }, 100)
  }, [])

  const hasRole = useCallback(
    (role: string | string[]): boolean => {
      if (Array.isArray(role)) {
        return role.some(
          (r: string) =>
            user?.roles?.some((ur: string) => ur.toUpperCase() === r.toUpperCase()) ?? false
        )
      }
      return user?.roles?.some((r: string) => r.toUpperCase() === role.toUpperCase()) ?? false
    },
    [user]
  )

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      return roles.some(
        (r: string) =>
          user?.roles?.some((ur: string) => ur.toUpperCase() === r.toUpperCase()) ?? false
      )
    },
    [user]
  )

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    return 'demo-token'
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: false,
    login,
    logout,
    hasRole,
    hasAnyRole,
    getAccessToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// useAuth is exported from AuthContext.shared.ts
export { useAuth } from './AuthContext.shared'
