/**
 * usePermissions — granular resource-level permission checks.
 *
 * Usage:
 *   const { can, canAny, canAccess, permissions } = usePermissions()
 *   if (can('users:delete')) { ... }
 *   if (canAccess('tasks', 'create')) { ... }
 */
import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  getPermissionsForRoles,
  hasPermissionMultiRole,
  hasAnyPermission,
  hasAllPermissions,
  type Permission,
  type Resource,
  type Action,
} from '@/lib/permissions'

export function usePermissions() {
  const { user } = useAuth()
  const roles = user?.roles ?? ['VIEWER']

  return useMemo(
    () => ({
      /** Check a single permission */
      can: (permission: Permission) => hasPermissionMultiRole(roles, permission),

      /** Check if user has at least one of the listed permissions */
      canAny: (permissions: Permission[]) => hasAnyPermission(roles, permissions),

      /** Check if user has ALL of the listed permissions */
      canAll: (permissions: Permission[]) => hasAllPermissions(roles, permissions),

      /** Shorthand: canAccess('users', 'delete') */
      canAccess: (resource: Resource, action: Action) =>
        hasPermissionMultiRole(roles, `${resource}:${action}`),

      /** All resolved permissions for the current user */
      permissions: getPermissionsForRoles(roles),

      /** Current roles */
      roles,
    }),
    [roles]
  )
}
