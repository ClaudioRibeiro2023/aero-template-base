/**
 * Helper de RBAC administrativo — consolida a lista de roles aceitas como
 * "administrativas" no template. Substitui comparações hardcoded
 * `role !== 'ADMIN' && role !== 'GESTOR'` que deixavam de fora roles
 * reais da plataforma Aero como `owner` e `master`.
 */

const ADMIN_ROLES = new Set([
  'admin',
  'administrator',
  'gestor',
  'manager',
  'owner',
  'master',
  'super_admin',
])

/** Retorna true se a role concede acesso administrativo. */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false
  return ADMIN_ROLES.has(role.toLowerCase())
}
