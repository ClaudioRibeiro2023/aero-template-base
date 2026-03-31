/**
 * Sistema de Permissões Granulares
 *
 * Evolução do sistema de roles para permissões mais específicas.
 * Permite controle fino de acesso a funcionalidades.
 */
import type { UserRole } from '@template/types'

// Tipos de ações
export type PermissionAction =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'EXECUTE'
  | 'EXPORT'
  | 'ADMIN'

// Recursos do sistema
export type PermissionResource =
  | 'DASHBOARD'
  | 'RELATORIOS'
  | 'EXEMPLO'
  | 'ETL'
  | 'CONFIGURACOES'
  | 'OBSERVABILIDADE'
  | 'DOCUMENTACAO'
  | 'LGPD'
  | 'ADMIN'
  | 'USUARIOS'
  | 'PERFIS'
  | 'ENTIDADES'
  | 'AUDITORIA'

// Permissão granular no formato "RECURSO.ACAO"
export type Permission = `${PermissionResource}.${PermissionAction}`

// UserRole importado de @template/types — fonte canônica: packages/types/src/auth.ts
export type { UserRole } from '@template/types'

/**
 * Mapeamento de Roles para Permissões
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // ADMIN tem todas as permissões
  ADMIN: [
    'DASHBOARD.VIEW',
    'DASHBOARD.EXPORT',
    'DASHBOARD.ADMIN',
    'RELATORIOS.VIEW',
    'RELATORIOS.CREATE',
    'RELATORIOS.EXPORT',
    'RELATORIOS.ADMIN',
    'EXEMPLO.VIEW',
    'EXEMPLO.CREATE',
    'EXEMPLO.EDIT',
    'EXEMPLO.DELETE',
    'EXEMPLO.EXPORT',
    'ETL.VIEW',
    'ETL.EXECUTE',
    'ETL.ADMIN',
    'CONFIGURACOES.VIEW',
    'CONFIGURACOES.EDIT',
    'CONFIGURACOES.ADMIN',
    'OBSERVABILIDADE.VIEW',
    'OBSERVABILIDADE.ADMIN',
    'DOCUMENTACAO.VIEW',
    'DOCUMENTACAO.EDIT',
    'LGPD.VIEW',
    'LGPD.EDIT',
    'LGPD.ADMIN',
    'ADMIN.VIEW',
    'ADMIN.CREATE',
    'ADMIN.EDIT',
    'ADMIN.DELETE',
    'ADMIN.ADMIN',
    'USUARIOS.VIEW',
    'USUARIOS.CREATE',
    'USUARIOS.EDIT',
    'USUARIOS.DELETE',
    'PERFIS.VIEW',
    'PERFIS.CREATE',
    'PERFIS.EDIT',
    'PERFIS.DELETE',
    'ENTIDADES.VIEW',
    'ENTIDADES.CREATE',
    'ENTIDADES.EDIT',
    'ENTIDADES.DELETE',
    'AUDITORIA.VIEW',
    'AUDITORIA.EXPORT',
  ],

  // GESTOR tem permissões de leitura, relatórios e exportação
  GESTOR: [
    'DASHBOARD.VIEW',
    'DASHBOARD.EXPORT',
    'RELATORIOS.VIEW',
    'RELATORIOS.CREATE',
    'RELATORIOS.EXPORT',
    'EXEMPLO.VIEW',
    'EXEMPLO.CREATE',
    'EXEMPLO.EDIT',
    'EXEMPLO.EXPORT',
    'ETL.VIEW',
    'CONFIGURACOES.VIEW',
    'OBSERVABILIDADE.VIEW',
    'DOCUMENTACAO.VIEW',
    'LGPD.VIEW',
    'USUARIOS.VIEW',
    'ENTIDADES.VIEW',
    'AUDITORIA.VIEW',
    'AUDITORIA.EXPORT',
  ],

  // OPERADOR tem permissões operacionais
  OPERADOR: [
    'DASHBOARD.VIEW',
    'RELATORIOS.VIEW',
    'RELATORIOS.EXPORT',
    'EXEMPLO.VIEW',
    'EXEMPLO.CREATE',
    'EXEMPLO.EDIT',
    'DOCUMENTACAO.VIEW',
    'LGPD.VIEW',
  ],

  // VIEWER tem apenas permissões de leitura
  VIEWER: ['DASHBOARD.VIEW', 'RELATORIOS.VIEW', 'EXEMPLO.VIEW', 'DOCUMENTACAO.VIEW', 'LGPD.VIEW'],
}

/**
 * Verificar se usuário tem permissão específica
 */
export function hasPermission(userRoles: UserRole[], permission: Permission): boolean {
  if (!userRoles || userRoles.length === 0) return false

  return userRoles.some(role => {
    const rolePermissions = ROLE_PERMISSIONS[role] || []
    return rolePermissions.includes(permission)
  })
}

/**
 * Verificar se usuário tem todas as permissões
 */
export function hasAllPermissions(userRoles: UserRole[], permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRoles, permission))
}

/**
 * Verificar se usuário tem pelo menos uma das permissões
 */
export function hasAnyPermission(userRoles: UserRole[], permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRoles, permission))
}

/**
 * Obter todas as permissões de um conjunto de roles
 */
export function getPermissions(userRoles: UserRole[]): Permission[] {
  const allPermissions = new Set<Permission>()

  userRoles.forEach(role => {
    const rolePermissions = ROLE_PERMISSIONS[role] || []
    rolePermissions.forEach(p => allPermissions.add(p))
  })

  return Array.from(allPermissions)
}

/**
 * Verificar se usuário pode realizar ação em recurso
 */
export function can(
  userRoles: UserRole[],
  action: PermissionAction,
  resource: PermissionResource
): boolean {
  const permission: Permission = `${resource}.${action}`
  return hasPermission(userRoles, permission)
}

/**
 * Obter permissões faltantes
 */
export function getMissingPermissions(
  userRoles: UserRole[],
  requiredPermissions: Permission[]
): Permission[] {
  return requiredPermissions.filter(p => !hasPermission(userRoles, p))
}

/**
 * Verificar nível de acesso a um recurso
 */
export function getAccessLevel(
  userRoles: UserRole[],
  resource: PermissionResource
): PermissionAction | null {
  const actionOrder: PermissionAction[] = [
    'ADMIN',
    'DELETE',
    'EDIT',
    'CREATE',
    'EXECUTE',
    'EXPORT',
    'VIEW',
  ]

  for (const action of actionOrder) {
    if (can(userRoles, action, resource)) {
      return action
    }
  }

  return null
}

/**
 * Permissões agrupadas por recurso para UI
 */
export const PERMISSIONS_BY_RESOURCE: Record<PermissionResource, Permission[]> = {
  DASHBOARD: ['DASHBOARD.VIEW', 'DASHBOARD.EXPORT', 'DASHBOARD.ADMIN'],
  RELATORIOS: ['RELATORIOS.VIEW', 'RELATORIOS.CREATE', 'RELATORIOS.EXPORT', 'RELATORIOS.ADMIN'],
  EXEMPLO: ['EXEMPLO.VIEW', 'EXEMPLO.CREATE', 'EXEMPLO.EDIT', 'EXEMPLO.DELETE', 'EXEMPLO.EXPORT'],
  ETL: ['ETL.VIEW', 'ETL.EXECUTE', 'ETL.ADMIN'],
  CONFIGURACOES: ['CONFIGURACOES.VIEW', 'CONFIGURACOES.EDIT', 'CONFIGURACOES.ADMIN'],
  OBSERVABILIDADE: ['OBSERVABILIDADE.VIEW', 'OBSERVABILIDADE.ADMIN'],
  DOCUMENTACAO: ['DOCUMENTACAO.VIEW', 'DOCUMENTACAO.EDIT'],
  LGPD: ['LGPD.VIEW', 'LGPD.EDIT', 'LGPD.ADMIN'],
  ADMIN: ['ADMIN.VIEW', 'ADMIN.CREATE', 'ADMIN.EDIT', 'ADMIN.DELETE', 'ADMIN.ADMIN'],
  USUARIOS: ['USUARIOS.VIEW', 'USUARIOS.CREATE', 'USUARIOS.EDIT', 'USUARIOS.DELETE'],
  PERFIS: ['PERFIS.VIEW', 'PERFIS.CREATE', 'PERFIS.EDIT', 'PERFIS.DELETE'],
  ENTIDADES: ['ENTIDADES.VIEW', 'ENTIDADES.CREATE', 'ENTIDADES.EDIT', 'ENTIDADES.DELETE'],
  AUDITORIA: ['AUDITORIA.VIEW', 'AUDITORIA.EXPORT'],
}
