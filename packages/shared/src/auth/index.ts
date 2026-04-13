// Shared auth context (works with both Supabase and Demo providers)
export { useAuth, AuthContext } from './AuthContext.shared'

// Demo provider (for dev/test mode)
export { DemoAuthProvider } from './DemoAuthProvider'

// Types
export type { UserRole, Role, AuthUser, AuthContextType } from './types'
export { ALL_ROLES, ROLE_ADMIN, ROLE_GESTOR, ROLE_OPERADOR, ROLE_VIEWER } from './types'

// Permissions system
export {
  ROLE_PERMISSIONS,
  PERMISSIONS_BY_RESOURCE,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasPermissionDynamic,
  getPermissions,
  can,
  getMissingPermissions,
  getAccessLevel,
} from './permissions'
export type { PermissionAction, PermissionResource, Permission } from './permissions'
