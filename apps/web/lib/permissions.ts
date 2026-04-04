// ============================================================================
// Granular Resource-Level Permissions System
// ============================================================================

/**
 * Resources available in the system
 */
export type Resource =
  | 'users'
  | 'roles'
  | 'tasks'
  | 'config'
  | 'audit'
  | 'reports'
  | 'feature-flags'

/**
 * Actions that can be performed on resources
 */
export type Action = 'read' | 'create' | 'update' | 'delete'

/**
 * A permission is a combination of resource and action
 */
export type Permission = `${Resource}:${Action}`

/**
 * Default role-to-permission mapping.
 * Uses UserRole values from @template/types: ADMIN | GESTOR | OPERADOR | VIEWER
 */
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'roles:read',
    'roles:create',
    'roles:update',
    'roles:delete',
    'tasks:read',
    'tasks:create',
    'tasks:update',
    'tasks:delete',
    'config:read',
    'config:update',
    'audit:read',
    'reports:read',
    'reports:create',
    'feature-flags:read',
    'feature-flags:update',
  ],
  GESTOR: [
    'users:read',
    'users:create',
    'users:update',
    'roles:read',
    'tasks:read',
    'tasks:create',
    'tasks:update',
    'tasks:delete',
    'config:read',
    'audit:read',
    'reports:read',
    'reports:create',
    'feature-flags:read',
  ],
  OPERADOR: ['tasks:read', 'tasks:create', 'tasks:update', 'reports:read', 'reports:create'],
  VIEWER: ['tasks:read', 'reports:read'],
}

/**
 * Get all permissions for a given role.
 * Falls back to VIEWER permissions for unknown roles.
 */
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.VIEWER
}

/**
 * Get merged permissions for multiple roles (user may have more than one).
 * Deduplicates automatically.
 */
export function getPermissionsForRoles(roles: string[]): Permission[] {
  const perms = new Set<Permission>()
  for (const role of roles) {
    for (const p of getPermissionsForRole(role)) {
      perms.add(p)
    }
  }
  return [...perms]
}

/**
 * Check if a single role grants a specific permission.
 */
export function hasPermission(userRole: string, permission: Permission): boolean {
  return getPermissionsForRole(userRole).includes(permission)
}

/**
 * Check if any of the user's roles grants a specific permission.
 */
export function hasPermissionMultiRole(roles: string[], permission: Permission): boolean {
  return roles.some(role => hasPermission(role, permission))
}

/**
 * Check if any of the user's roles grants at least one of the listed permissions.
 */
export function hasAnyPermission(roles: string[], permissions: Permission[]): boolean {
  const userPerms = getPermissionsForRoles(roles)
  return permissions.some(p => userPerms.includes(p))
}

/**
 * Check if the user's roles grant ALL of the listed permissions.
 */
export function hasAllPermissions(roles: string[], permissions: Permission[]): boolean {
  const userPerms = getPermissionsForRoles(roles)
  return permissions.every(p => userPerms.includes(p))
}
