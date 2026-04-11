/**
 * Auth guard — delega para @template/data SupabaseAuthGateway.
 *
 * @deprecated v3.0: Use `getAuthGateway()` de `@/lib/data` diretamente.
 * Assinaturas mantidas para backward-compatibility durante transição.
 * Este arquivo será removido no Sprint 7 (cleanup).
 */
import { SupabaseAuthGateway } from '@template/data/supabase'
import type { UserRole } from '@template/types'

interface GuardResult {
  user: { id: string; email: string; role: UserRole } | null
  error: string | null
}

/** @deprecated Use `getAuthGateway().getUser()` de `@/lib/data` */
export async function getAuthUser(): Promise<GuardResult> {
  const gateway = new SupabaseAuthGateway()
  const result = await gateway.getUser()
  return {
    user: result.user
      ? { id: result.user.id, email: result.user.email, role: result.user.role as UserRole }
      : null,
    error: result.error,
  }
}

/** @deprecated Use `getAuthGateway().getUser()` de `@/lib/data` */
export async function requireAuth(): Promise<{ id: string; email: string; role: UserRole } | null> {
  const { user } = await getAuthUser()
  return user
}

/** @deprecated Use `getAuthGateway().requireRole()` de `@/lib/data` */
export async function requireRole(
  roles: UserRole | UserRole[]
): Promise<{ id: string; email: string; role: UserRole } | null> {
  const { user } = await getAuthUser()
  if (!user) return null
  const allowed = Array.isArray(roles) ? roles : [roles]
  if (!allowed.includes(user.role)) return null
  return user
}
