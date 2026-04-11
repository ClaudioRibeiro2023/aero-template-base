/**
 * Tests for @template/auth — re-export de permissões e roles.
 */
import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  hasAnyPermission,
  can,
  ROLE_PERMISSIONS,
  ALL_ROLES,
  ROLE_ADMIN,
  ROLE_VIEWER,
  getAccessLevel,
} from '../index'

describe('hasPermission', () => {
  it('ADMIN tem permissao DASHBOARD.ADMIN', () => {
    expect(hasPermission(['ADMIN'], 'DASHBOARD.ADMIN')).toBe(true)
  })

  it('VIEWER nao tem permissao ADMIN.DELETE', () => {
    expect(hasPermission(['VIEWER'], 'ADMIN.DELETE')).toBe(false)
  })

  it('retorna false para array de roles vazio', () => {
    expect(hasPermission([], 'DASHBOARD.VIEW')).toBe(false)
  })
})

describe('hasAnyPermission', () => {
  it('OPERADOR tem pelo menos uma das permissoes de leitura', () => {
    expect(hasAnyPermission(['OPERADOR'], ['DASHBOARD.VIEW', 'ADMIN.DELETE'])).toBe(true)
  })

  it('VIEWER nao tem nenhuma permissao de escrita', () => {
    expect(hasAnyPermission(['VIEWER'], ['ADMIN.DELETE', 'USUARIOS.CREATE'])).toBe(false)
  })

  it('retorna false para permissoes vazias', () => {
    expect(hasAnyPermission(['ADMIN'], [])).toBe(false)
  })
})

describe('can', () => {
  it('ADMIN can ADMIN DASHBOARD', () => {
    expect(can(['ADMIN'], 'ADMIN', 'DASHBOARD')).toBe(true)
  })

  it('VIEWER cannot EDIT CONFIGURACOES', () => {
    expect(can(['VIEWER'], 'EDIT', 'CONFIGURACOES')).toBe(false)
  })

  it('GESTOR can EXPORT RELATORIOS', () => {
    expect(can(['GESTOR'], 'EXPORT', 'RELATORIOS')).toBe(true)
  })
})

describe('exports', () => {
  it('ALL_ROLES contem 4 roles', () => {
    expect(ALL_ROLES).toHaveLength(4)
  })

  it('ROLE_ADMIN e ROLE_VIEWER sao strings corretas', () => {
    expect(ROLE_ADMIN).toBe('ADMIN')
    expect(ROLE_VIEWER).toBe('VIEWER')
  })

  it('ROLE_PERMISSIONS cobre todas as roles', () => {
    expect(Object.keys(ROLE_PERMISSIONS)).toEqual(
      expect.arrayContaining(['ADMIN', 'GESTOR', 'OPERADOR', 'VIEWER'])
    )
  })
})
