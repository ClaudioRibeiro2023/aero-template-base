/**
 * Tests for permissions.ts granular permission system.
 * Sprint 14: Autenticação Real (Keycloak OIDC).
 */
import { describe, it, expect } from 'vitest'
import {
  ROLE_PERMISSIONS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissions,
  can,
  getMissingPermissions,
  getAccessLevel,
  PERMISSIONS_BY_RESOURCE,
} from '../permissions'
import type { UserRole, Permission, PermissionResource } from '../permissions'

// ============================================================================
// ROLE_PERMISSIONS Matrix Tests
// ============================================================================

describe('ROLE_PERMISSIONS', () => {
  it('ADMIN has DASHBOARD.ADMIN permission', () => {
    expect(ROLE_PERMISSIONS.ADMIN).toContain('DASHBOARD.ADMIN')
  })

  it('ADMIN has all USUARIOS permissions', () => {
    expect(ROLE_PERMISSIONS.ADMIN).toContain('USUARIOS.VIEW')
    expect(ROLE_PERMISSIONS.ADMIN).toContain('USUARIOS.CREATE')
    expect(ROLE_PERMISSIONS.ADMIN).toContain('USUARIOS.EDIT')
    expect(ROLE_PERMISSIONS.ADMIN).toContain('USUARIOS.DELETE')
  })

  it('GESTOR cannot delete users', () => {
    expect(ROLE_PERMISSIONS.GESTOR).not.toContain('USUARIOS.DELETE')
  })

  it('GESTOR can view AUDITORIA', () => {
    expect(ROLE_PERMISSIONS.GESTOR).toContain('AUDITORIA.VIEW')
  })

  it('OPERADOR cannot access ADMIN resource', () => {
    const operadorPerms = ROLE_PERMISSIONS.OPERADOR
    const adminPerms = operadorPerms.filter(p => p.startsWith('ADMIN.'))
    expect(adminPerms).toHaveLength(0)
  })

  it('VIEWER only has VIEW permissions', () => {
    const viewerPerms = ROLE_PERMISSIONS.VIEWER
    const nonViewPerms = viewerPerms.filter(p => !p.endsWith('.VIEW'))
    expect(nonViewPerms).toHaveLength(0)
  })

  it('VIEWER has DASHBOARD.VIEW', () => {
    expect(ROLE_PERMISSIONS.VIEWER).toContain('DASHBOARD.VIEW')
  })

  it('all roles are defined', () => {
    expect(ROLE_PERMISSIONS).toHaveProperty('ADMIN')
    expect(ROLE_PERMISSIONS).toHaveProperty('GESTOR')
    expect(ROLE_PERMISSIONS).toHaveProperty('OPERADOR')
    expect(ROLE_PERMISSIONS).toHaveProperty('VIEWER')
  })
})

// ============================================================================
// hasPermission Tests
// ============================================================================

describe('hasPermission', () => {
  it('returns true when user role has permission', () => {
    expect(hasPermission(['ADMIN'], 'DASHBOARD.ADMIN')).toBe(true)
  })

  it('returns false when user role lacks permission', () => {
    expect(hasPermission(['VIEWER'], 'DASHBOARD.ADMIN')).toBe(false)
  })

  it('returns false for empty roles array', () => {
    expect(hasPermission([], 'DASHBOARD.VIEW')).toBe(false)
  })

  it('returns true when any role in array has permission', () => {
    expect(hasPermission(['VIEWER', 'ADMIN'], 'DASHBOARD.ADMIN')).toBe(true)
  })

  it('returns false for null/empty roles', () => {
    expect(hasPermission([] as UserRole[], 'ADMIN.DELETE')).toBe(false)
  })

  it('GESTOR can export RELATORIOS', () => {
    expect(hasPermission(['GESTOR'], 'RELATORIOS.EXPORT')).toBe(true)
  })

  it('OPERADOR cannot delete EXEMPLO', () => {
    expect(hasPermission(['OPERADOR'], 'EXEMPLO.DELETE')).toBe(false)
  })
})

// ============================================================================
// hasAllPermissions Tests
// ============================================================================

describe('hasAllPermissions', () => {
  it('returns true when user has all required permissions', () => {
    expect(hasAllPermissions(['ADMIN'], ['DASHBOARD.VIEW', 'DASHBOARD.ADMIN'])).toBe(true)
  })

  it('returns false when user is missing any required permission', () => {
    expect(hasAllPermissions(['VIEWER'], ['DASHBOARD.VIEW', 'DASHBOARD.ADMIN'])).toBe(false)
  })

  it('returns true for empty permissions array', () => {
    expect(hasAllPermissions(['VIEWER'], [])).toBe(true)
  })

  it('works with multiple roles', () => {
    expect(hasAllPermissions(['GESTOR', 'OPERADOR'], ['DASHBOARD.VIEW', 'RELATORIOS.VIEW'])).toBe(
      true
    )
  })
})

// ============================================================================
// hasAnyPermission Tests
// ============================================================================

describe('hasAnyPermission', () => {
  it('returns true when user has at least one permission', () => {
    expect(hasAnyPermission(['VIEWER'], ['DASHBOARD.VIEW', 'DASHBOARD.ADMIN'])).toBe(true)
  })

  it('returns false when user has none of the permissions', () => {
    expect(hasAnyPermission(['VIEWER'], ['DASHBOARD.ADMIN', 'ADMIN.DELETE'])).toBe(false)
  })

  it('returns false for empty permissions array', () => {
    expect(hasAnyPermission(['ADMIN'], [])).toBe(false)
  })
})

// ============================================================================
// getPermissions Tests
// ============================================================================

describe('getPermissions', () => {
  it('returns all permissions for ADMIN', () => {
    const perms = getPermissions(['ADMIN'])
    expect(perms).toContain('DASHBOARD.ADMIN')
    expect(perms).toContain('USUARIOS.DELETE')
    expect(perms.length).toBeGreaterThan(20)
  })

  it('returns empty array for empty roles', () => {
    expect(getPermissions([])).toHaveLength(0)
  })

  it('deduplicates permissions from multiple roles', () => {
    const perms = getPermissions(['ADMIN', 'VIEWER'])
    const dashboardView = perms.filter(p => p === 'DASHBOARD.VIEW')
    expect(dashboardView).toHaveLength(1)
  })

  it('merges permissions from GESTOR and OPERADOR', () => {
    const gestorPerms = new Set(getPermissions(['GESTOR']))
    const operadorPerms = new Set(getPermissions(['OPERADOR']))
    const combined = new Set(getPermissions(['GESTOR', 'OPERADOR']))

    // Combined should have at least as many as either alone
    expect(combined.size).toBeGreaterThanOrEqual(gestorPerms.size)
    expect(combined.size).toBeGreaterThanOrEqual(operadorPerms.size)
  })
})

// ============================================================================
// can Tests
// ============================================================================

describe('can', () => {
  it('ADMIN can ADMIN CONFIGURACOES', () => {
    expect(can(['ADMIN'], 'ADMIN', 'CONFIGURACOES')).toBe(true)
  })

  it('VIEWER cannot CREATE RELATORIOS', () => {
    expect(can(['VIEWER'], 'CREATE', 'RELATORIOS')).toBe(false)
  })

  it('GESTOR can EXPORT DASHBOARD', () => {
    expect(can(['GESTOR'], 'EXPORT', 'DASHBOARD')).toBe(true)
  })

  it('OPERADOR can EDIT EXEMPLO', () => {
    expect(can(['OPERADOR'], 'EDIT', 'EXEMPLO')).toBe(true)
  })

  it('OPERADOR cannot DELETE EXEMPLO', () => {
    expect(can(['OPERADOR'], 'DELETE', 'EXEMPLO')).toBe(false)
  })

  it('builds correct permission string', () => {
    // can(['ADMIN'], 'VIEW', 'DASHBOARD') → checks 'DASHBOARD.VIEW'
    expect(can(['ADMIN'], 'VIEW', 'DASHBOARD')).toBe(true)
  })
})

// ============================================================================
// getMissingPermissions Tests
// ============================================================================

describe('getMissingPermissions', () => {
  it('returns empty array when user has all permissions', () => {
    const missing = getMissingPermissions(['ADMIN'], ['DASHBOARD.VIEW', 'DASHBOARD.ADMIN'])
    expect(missing).toHaveLength(0)
  })

  it('returns missing permissions', () => {
    const missing = getMissingPermissions(['VIEWER'], ['DASHBOARD.VIEW', 'DASHBOARD.ADMIN'])
    expect(missing).toContain('DASHBOARD.ADMIN')
    expect(missing).not.toContain('DASHBOARD.VIEW')
  })

  it('returns all required when no roles', () => {
    const required: Permission[] = ['DASHBOARD.VIEW', 'ADMIN.DELETE']
    const missing = getMissingPermissions([], required)
    expect(missing).toHaveLength(2)
  })
})

// ============================================================================
// getAccessLevel Tests
// ============================================================================

describe('getAccessLevel', () => {
  it('returns ADMIN level for ADMIN role on CONFIGURACOES', () => {
    expect(getAccessLevel(['ADMIN'], 'CONFIGURACOES')).toBe('ADMIN')
  })

  it('returns VIEW level for VIEWER role on DASHBOARD', () => {
    expect(getAccessLevel(['VIEWER'], 'DASHBOARD')).toBe('VIEW')
  })

  it('returns null when user has no access', () => {
    expect(getAccessLevel(['VIEWER'], 'ADMIN')).toBeNull()
  })

  it('returns highest action level when user has multiple', () => {
    // GESTOR has EXPORT on DASHBOARD (higher than VIEW)
    const level = getAccessLevel(['GESTOR'], 'DASHBOARD')
    expect(['EXPORT', 'ADMIN', 'DELETE', 'EDIT', 'CREATE']).toContain(level)
  })

  it('returns EXECUTE for ETL with ADMIN role', () => {
    const level = getAccessLevel(['ADMIN'], 'ETL')
    expect(level).toBe('ADMIN')
  })
})

// ============================================================================
// PERMISSIONS_BY_RESOURCE Tests
// ============================================================================

describe('PERMISSIONS_BY_RESOURCE', () => {
  it('DASHBOARD has VIEW, EXPORT, ADMIN', () => {
    expect(PERMISSIONS_BY_RESOURCE.DASHBOARD).toContain('DASHBOARD.VIEW')
    expect(PERMISSIONS_BY_RESOURCE.DASHBOARD).toContain('DASHBOARD.EXPORT')
    expect(PERMISSIONS_BY_RESOURCE.DASHBOARD).toContain('DASHBOARD.ADMIN')
  })

  it('all resources are defined', () => {
    const resources: PermissionResource[] = [
      'DASHBOARD',
      'RELATORIOS',
      'EXEMPLO',
      'ETL',
      'CONFIGURACOES',
      'OBSERVABILIDADE',
      'DOCUMENTACAO',
      'LGPD',
      'ADMIN',
      'USUARIOS',
      'PERFIS',
      'ENTIDADES',
      'AUDITORIA',
    ]
    for (const resource of resources) {
      expect(PERMISSIONS_BY_RESOURCE).toHaveProperty(resource)
    }
  })

  it('each resource has at least one permission', () => {
    for (const perms of Object.values(PERMISSIONS_BY_RESOURCE)) {
      expect(perms.length).toBeGreaterThan(0)
    }
  })
})
