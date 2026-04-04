/**
 * Testes do sistema de permissoes granulares (lib/permissions.ts).
 * Cobre: mapeamento por role, hasPermission, hasAnyPermission, hasAllPermissions, fallback.
 */
import { describe, it, expect } from 'vitest'
import {
  getPermissionsForRole,
  getPermissionsForRoles,
  hasPermission,
  hasPermissionMultiRole,
  hasAnyPermission,
  hasAllPermissions,
} from '../../lib/permissions'

describe('getPermissionsForRole', () => {
  it('ADMIN tem todas as permissoes (19)', () => {
    const perms = getPermissionsForRole('ADMIN')
    expect(perms.length).toBe(19)
    expect(perms).toContain('users:delete')
    expect(perms).toContain('roles:delete')
    expect(perms).toContain('config:update')
    expect(perms).toContain('feature-flags:update')
  })

  it('GESTOR tem permissoes intermediarias (sem delete de users/roles, sem config:update)', () => {
    const perms = getPermissionsForRole('GESTOR')
    expect(perms).toContain('users:read')
    expect(perms).toContain('users:create')
    expect(perms).toContain('users:update')
    expect(perms).not.toContain('users:delete')
    expect(perms).not.toContain('roles:delete')
    expect(perms).not.toContain('config:update')
    expect(perms).toContain('audit:read')
  })

  it('OPERADOR tem permissoes limitadas a tasks e reports', () => {
    const perms = getPermissionsForRole('OPERADOR')
    expect(perms).toContain('tasks:read')
    expect(perms).toContain('tasks:create')
    expect(perms).toContain('tasks:update')
    expect(perms).toContain('reports:read')
    expect(perms).toContain('reports:create')
    expect(perms).not.toContain('users:read')
    expect(perms).not.toContain('audit:read')
    expect(perms.length).toBe(5)
  })

  it('VIEWER tem apenas leitura de tasks e reports', () => {
    const perms = getPermissionsForRole('VIEWER')
    expect(perms).toEqual(['tasks:read', 'reports:read'])
  })

  it('role desconhecida faz fallback para VIEWER', () => {
    const perms = getPermissionsForRole('UNKNOWN_ROLE')
    expect(perms).toEqual(getPermissionsForRole('VIEWER'))
  })
})

describe('getPermissionsForRoles', () => {
  it('merge permissoes de multiplas roles sem duplicatas', () => {
    const perms = getPermissionsForRoles(['OPERADOR', 'VIEWER'])
    // VIEWER adds nothing new over OPERADOR, so same 5
    expect(perms.length).toBe(5)
  })

  it('merge GESTOR + OPERADOR combina permissoes', () => {
    const perms = getPermissionsForRoles(['GESTOR', 'OPERADOR'])
    // GESTOR is superset of OPERADOR — should have GESTOR's count (13)
    expect(perms).toContain('users:read')
    expect(perms).toContain('tasks:create')
  })

  it('array vazio retorna array vazio', () => {
    expect(getPermissionsForRoles([])).toEqual([])
  })
})

describe('hasPermission', () => {
  it('ADMIN tem users:delete', () => {
    expect(hasPermission('ADMIN', 'users:delete')).toBe(true)
  })

  it('VIEWER nao tem users:delete', () => {
    expect(hasPermission('VIEWER', 'users:delete')).toBe(false)
  })

  it('GESTOR tem audit:read', () => {
    expect(hasPermission('GESTOR', 'audit:read')).toBe(true)
  })

  it('OPERADOR nao tem audit:read', () => {
    expect(hasPermission('OPERADOR', 'audit:read')).toBe(false)
  })
})

describe('hasPermissionMultiRole', () => {
  it('retorna true se qualquer role tem a permissao', () => {
    expect(hasPermissionMultiRole(['VIEWER', 'ADMIN'], 'users:delete')).toBe(true)
  })

  it('retorna false se nenhuma role tem a permissao', () => {
    expect(hasPermissionMultiRole(['VIEWER', 'OPERADOR'], 'users:delete')).toBe(false)
  })
})

describe('hasAnyPermission', () => {
  it('retorna true se pelo menos uma permissao e satisfeita', () => {
    expect(hasAnyPermission(['VIEWER'], ['users:delete', 'tasks:read'])).toBe(true)
  })

  it('retorna false se nenhuma permissao e satisfeita', () => {
    expect(hasAnyPermission(['VIEWER'], ['users:delete', 'config:update'])).toBe(false)
  })
})

describe('hasAllPermissions', () => {
  it('retorna true quando todas as permissoes sao satisfeitas', () => {
    expect(hasAllPermissions(['ADMIN'], ['users:read', 'users:delete', 'config:update'])).toBe(true)
  })

  it('retorna false quando pelo menos uma permissao falta', () => {
    expect(hasAllPermissions(['GESTOR'], ['users:read', 'users:delete'])).toBe(false)
  })

  it('retorna true para array vazio de permissoes', () => {
    expect(hasAllPermissions(['VIEWER'], [])).toBe(true)
  })
})
