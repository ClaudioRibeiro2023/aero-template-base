/**
 * POST /api/users/bulk — Operações em massa em usuários
 *
 * Body: { action: 'deactivate' | 'change_role', ids: string[], role?: string }
 * Requer ADMIN.
 *
 * v3.0: Usa SupabaseDbClient para batch update via .in()
 */
import type { NextRequest } from 'next/server'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized, forbidden, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { SupabaseDbClient } from '@template/data/supabase'
import { withApiLog } from '@/lib/logger'
import { auditLog } from '@/lib/audit-log'

export const dynamic = 'force-dynamic'

const VALID_ACTIONS = ['deactivate', 'change_role'] as const
const VALID_ROLES = ['ADMIN', 'GESTOR', 'OPERADOR', 'VIEWER'] as const
type BulkAction = (typeof VALID_ACTIONS)[number]

export const POST = withApiLog('users-bulk', async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()
  if (user.role !== 'ADMIN') return forbidden('Apenas ADMIN pode executar operações em massa')

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Body inválido')

  const action = body.action as BulkAction
  const ids = body.ids as string[]

  if (!VALID_ACTIONS.includes(action)) {
    return badRequest(`Ação inválida. Válidas: ${VALID_ACTIONS.join(', ')}`)
  }

  if (!Array.isArray(ids) || ids.length === 0 || ids.length > 100) {
    return badRequest('ids deve ser um array com 1-100 elementos')
  }

  if (ids.includes(user.id)) {
    return badRequest('Não é possível executar operação em massa no próprio usuário')
  }

  try {
    const db = new SupabaseDbClient()
    const client = await db.asUser()
    let affected = 0

    if (action === 'deactivate') {
      const { count, error: updateError } = await client
        .from('profiles')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('id', ids)

      if (updateError) throw updateError
      affected = count ?? ids.length
    }

    if (action === 'change_role') {
      const role = body.role as string | undefined
      if (!role || !VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
        return badRequest(`Role inválido. Válidos: ${VALID_ROLES.join(', ')}`)
      }

      const { count, error: updateError } = await client
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .in('id', ids)

      if (updateError) throw updateError
      affected = count ?? ids.length
    }

    const auditAction = action === 'deactivate' ? 'BULK_DEACTIVATE' : 'BULK_ROLE_CHANGE'
    await auditLog({
      userId: user.id,
      action: auditAction,
      resource: 'profiles',
      details: { ids, affected, ...(action === 'change_role' ? { role: body.role } : {}) },
    })

    return ok({ action, affected, ids })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro na operação em massa')
  }
})
