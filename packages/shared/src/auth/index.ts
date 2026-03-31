// Shared auth context (works with both Supabase and Demo providers)
export { useAuth, AuthContext } from './AuthContext.shared'

// Types
export type { UserRole, Role, AuthUser, AuthContextType } from './types'
export { ALL_ROLES, ROLE_ADMIN, ROLE_GESTOR, ROLE_OPERADOR, ROLE_VIEWER } from './types'
