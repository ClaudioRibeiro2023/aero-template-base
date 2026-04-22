/**
 * Supabase Auth Provider
 *
 * Default auth provider for the template platform.
 * Uses @supabase/supabase-js for session management.
 * Compatible with AuthContextType interface.
 */
import { useEffect, useState, useCallback, type ReactNode } from 'react'
import type { AuthContextType, AuthUser, UserRole } from '@template/types'
import { supabase } from '../supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import { AuthContext } from './AuthContext.shared'

function mapSupabaseUser(user: User, _session: Session | null): AuthUser {
  const metadata = user.user_metadata || {}
  const appMetadata = user.app_metadata || {}

  // SECURITY: Role MUST come from app_metadata (immutable by user).
  // NEVER read role from user_metadata — it can be modified by the user
  // via Supabase's public API, enabling privilege escalation (P0-01).
  const role = (appMetadata.role || 'VIEWER').toUpperCase() as UserRole

  return {
    id: user.id,
    email: user.email || '',
    name:
      metadata.display_name ||
      metadata.name ||
      metadata.full_name ||
      user.email?.split('@')[0] ||
      '',
    roles: [role],
  }
}

interface SupabaseAuthProviderProps {
  children: ReactNode
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // getSession() pode falhar com "Refresh Token Not Found" quando ha
    // token stale no localStorage (caso classico em /login apos logout).
    // Sem try/catch o erro cascateia pelo _handleTokenChanged do
    // GoTrueClient interno e gera loop de 400/429 em /auth/v1/token.
    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          // Token stale — limpar storage local SEM chamar o endpoint remoto
          // (scope local evita 403 quando o refresh ja esta revogado).
          if (
            error.message?.includes('Refresh Token') ||
            error.message?.includes('refresh_token')
          ) {
            try {
              await supabase.auth.signOut({ scope: 'local' })
            } catch {
              /* swallow — storage pode ter sido limpo em paralelo */
            }
          }
          if (mounted) {
            setUser(null)
            setIsAuthenticated(false)
            setIsLoading(false)
          }
          return
        }
        if (mounted) {
          if (data.session?.user) {
            setUser(mapSupabaseUser(data.session.user, data.session))
            setIsAuthenticated(true)
          }
          setIsLoading(false)
        }
      } catch {
        if (mounted) {
          setUser(null)
          setIsAuthenticated(false)
          setIsLoading(false)
        }
      }
    }

    void bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) {
        setUser(mapSupabaseUser(session.user, session))
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async () => {
    // Default: redirect to Supabase Auth UI or OAuth
    // Override in your app for custom login flows
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
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
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
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
