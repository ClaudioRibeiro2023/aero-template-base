'use client'

import { usePermissions } from '@/hooks/usePermissions'
import type { Permission } from '@/lib/permissions'
import type { ReactNode } from 'react'

interface PermissionGateProps {
  /** Single permission to check */
  permission?: Permission
  /** Multiple permissions to check */
  permissions?: Permission[]
  /** If true, requires ALL permissions; otherwise requires ANY (default: false) */
  requireAll?: boolean
  /** Rendered when access is denied (default: null) */
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Conditionally renders children based on the current user's permissions.
 *
 * Usage:
 *   <PermissionGate permission="users:delete">
 *     <DeleteButton />
 *   </PermissionGate>
 *
 *   <PermissionGate permissions={['config:read', 'config:update']} requireAll>
 *     <ConfigEditor />
 *   </PermissionGate>
 */
export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canAny, canAll } = usePermissions()

  let allowed = false

  if (permission) {
    allowed = can(permission)
  } else if (permissions && permissions.length > 0) {
    allowed = requireAll ? canAll(permissions) : canAny(permissions)
  }

  return allowed ? <>{children}</> : <>{fallback}</>
}
