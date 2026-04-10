/**
 * POST /api/users/bulk — Operações em massa em usuários
 *
 * Body: { action: 'deactivate' | 'change_role', ids: string[], role?: string }
 * Requer ADMIN.
 */
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/app/lib/supabase-server'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized, forbidden, serverError } from '@/lib/api-response'
import { getAuthUser } from '@/lib/auth-guard'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const VALID_ACTIONS = ['deactivate', 'change_role'] as const
const VALID_ROLES = ['ADMIN', 'GESTOR', 'OPERADOR', 'VIEWER'] as const
type BulkAction = (typeof VALID_ACTIONS)[number]

export const POST = withApiLog('users-bulk', async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const { user, error } = await getAuthUser()
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

  // Prevenir auto-operação
  if (ids.includes(user.id)) {
    return badRequest('Não é possível executar operação em massa no próprio usuário')
  }

  try {
    const supabase = await createServerSupabase()
    let affected = 0

    if (action === 'deactivate') {
      const { count, error: updateError } = await supabase
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

      const { count, error: updateError } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .in('id', ids)

      if (updateError) throw updateError
      affected = count ?? ids.length
    }

    return ok({ action, affected, ids })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro na operação em massa')
  }
})
