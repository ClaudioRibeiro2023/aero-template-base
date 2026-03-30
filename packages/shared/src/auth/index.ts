// Shared auth context (works with both Demo and Supabase providers)
export { useAuth, AuthContext } from './AuthContext.shared'

// Providers
export { SupabaseAuthProvider } from './SupabaseAuthProvider'
export { DemoAuthProvider } from './DemoAuthProvider'

// Auth adapter
export { getAuthProvider, type AuthProvider, type AuthAdapter } from './authAdapter'

// OIDC config (for Keycloak optional)
export { oidcConfig } from './oidcConfig'

// Legacy re-exports for backward compatibility
export { AuthProvider as OidcAuthProvider } from './AuthContext'
export { getUserManager } from './AuthContext'

// Types
export type { UserRole, Role, AuthUser, AuthContextType } from './types'
export { ALL_ROLES, ROLE_ADMIN, ROLE_GESTOR, ROLE_OPERADOR, ROLE_VIEWER } from './types'
