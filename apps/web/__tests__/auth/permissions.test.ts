import { describe, it, expect } from 'vitest'
import { hasPermissionDynamic } from '@template/shared/auth'
import type { Permission } from '@template/shared/auth'

// ── Role definitions simulando dados do banco ──
const roleDefinitions = [
  {
    name: 'CUSTOM_EDITOR',
    permissions: ['DASHBOARD.VIEW', 'RELATORIOS.VIEW', 'RELATORIOS.CREATE', 'EXEMPLO.EDIT'],
  },
  {
    name: 'CUSTOM_VIEWER',
    permissions: ['DASHBOARD.VIEW'],
  },
  {
    name: 'EMPTY_ROLE',
    permissions: [],
  },
]

describe('hasPermissionDynamic', () => {
  // ── System roles (fallback) ──

  it('ADMIN (system role) tem acesso total via fallback', () => {
    expect(hasPermissionDynamic(roleDefinitions, 'ADMIN', 'DASHBOARD.ADMIN')).toBe(true)
    expect(hasPermissionDynamic(roleDefinitions, 'ADMIN', 'USUARIOS.DELETE')).toBe(true)
    expect(hasPermissionDynamic(roleDefinitions, 'ADMIN', 'ADMIN.ADMIN')).toBe(true)
  })

  it('VIEWER (system role) tem apenas VIEW via fallback', () => {
    expect(hasPermissionDynamic(roleDefinitions, 'VIEWER', 'DASHBOARD.VIEW')).toBe(true)
    expect(hasPermissionDynamic(roleDefinitions, 'VIEWER', 'DASHBOARD.ADMIN')).toBe(false)
  })

  it('GESTOR (system role) pode exportar relatorios via fallback', () => {
    expect(hasPermissionDynamic(roleDefinitions, 'GESTOR', 'RELATORIOS.EXPORT')).toBe(true)
  })

  // ── Custom roles (from role_definitions) ──

  it('custom role com permissoes especificas retorna true para permissao concedida', () => {
    expect(hasPermissionDynamic(roleDefinitions, 'CUSTOM_EDITOR', 'DASHBOARD.VIEW')).toBe(true)
    expect(hasPermissionDynamic(roleDefinitions, 'CUSTOM_EDITOR', 'RELATORIOS.CREATE')).toBe(true)
    expect(hasPermissionDynamic(roleDefinitions, 'CUSTOM_EDITOR', 'EXEMPLO.EDIT')).toBe(true)
  })

  it('custom role retorna false para permissao nao concedida', () => {
    expect(hasPermissionDynamic(roleDefinitions, 'CUSTOM_EDITOR', 'ADMIN.ADMIN')).toBe(false)
    expect(hasPermissionDynamic(roleDefinitions, 'CUSTOM_EDITOR', 'USUARIOS.DELETE')).toBe(false)
  })

  it('custom viewer tem apenas DASHBOARD.VIEW', () => {
    expect(hasPermissionDynamic(roleDefinitions, 'CUSTOM_VIEWER', 'DASHBOARD.VIEW')).toBe(true)
    expect(hasPermissionDynamic(roleDefinitions, 'CUSTOM_VIEWER', 'RELATORIOS.VIEW')).toBe(false)
  })

  it('custom role com permissions vazio retorna false para qualquer permissao', () => {
    expect(hasPermissionDynamic(roleDefinitions, 'EMPTY_ROLE', 'DASHBOARD.VIEW')).toBe(false)
  })

  // ── Unknown role ──

  it('role desconhecida faz fallback para verificacao de system role', () => {
    // 'UNKNOWN_ROLE' nao existe em roleDefinitions nem em ROLE_PERMISSIONS
    // O fallback tenta hasPermission(['UNKNOWN_ROLE'], permission) que retorna false
    expect(hasPermissionDynamic(roleDefinitions, 'UNKNOWN_ROLE', 'DASHBOARD.VIEW')).toBe(false)
  })

  it('role nao encontrada retorna false para non-system roles', () => {
    expect(hasPermissionDynamic(roleDefinitions, 'NON_EXISTENT', 'ADMIN.ADMIN')).toBe(false)
    expect(hasPermissionDynamic(roleDefinitions, 'RANDOM_ROLE', 'USUARIOS.DELETE')).toBe(false)
  })

  // ── Edge cases ──

  it('roleDefinitions vazio faz fallback para system roles', () => {
    expect(hasPermissionDynamic([], 'ADMIN', 'DASHBOARD.VIEW')).toBe(true)
    expect(hasPermissionDynamic([], 'VIEWER', 'DASHBOARD.VIEW')).toBe(true)
    expect(hasPermissionDynamic([], 'VIEWER', 'ADMIN.ADMIN')).toBe(false)
  })

  it('roleDefinitions vazio com role desconhecida retorna false', () => {
    expect(hasPermissionDynamic([], 'UNKNOWN', 'DASHBOARD.VIEW')).toBe(false)
  })

  it('prioriza role_definition encontrada sobre system role', () => {
    // Se uma custom role tem o mesmo nome de um system role,
    // a definicao customizada prevalece
    const customDefs = [
      {
        name: 'ADMIN',
        permissions: ['DASHBOARD.VIEW'], // ADMIN customizado com permissoes limitadas
      },
    ]
    // Deve usar as permissoes da definicao encontrada, nao do system role
    expect(hasPermissionDynamic(customDefs, 'ADMIN', 'DASHBOARD.VIEW')).toBe(true)
    expect(hasPermissionDynamic(customDefs, 'ADMIN', 'ADMIN.ADMIN')).toBe(false)
  })
})
