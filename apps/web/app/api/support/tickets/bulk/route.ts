/**
 * POST /api/support/tickets/bulk — Operações em massa em tickets
 *
 * Body: { action: 'close' | 'reassign', ids: string[], assignee_id?: string }
 */
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/app/lib/supabase-server'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized, serverError } from '@/lib/api-response'
import { getAuthUser } from '@/lib/auth-guard'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const VALID_ACTIONS = ['close', 'reassign'] as const
type BulkAction = (typeof VALID_ACTIONS)[number]

export const POST = withApiLog('tickets-bulk', async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const { user, error } = await getAuthUser()
  if (error || !user) return unauthorized()

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

  try {
    const supabase = await createServerSupabase()
    let affected = 0

    if (action === 'close') {
      const { count, error: updateError } = await supabase
        .from('support_tickets')
        .update({ status: 'closed', updated_at: new Date().toISOString() })
        .in('id', ids)

      if (updateError) throw updateError
      affected = count ?? ids.length
    }

    if (action === 'reassign') {
      const assigneeId = body.assignee_id as string | undefined
      if (!assigneeId) return badRequest('assignee_id é obrigatório para reassign')

      const { count, error: updateError } = await supabase
        .from('support_tickets')
        .update({
          assignee_id: assigneeId,
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .in('id', ids)

      if (updateError) throw updateError
      affected = count ?? ids.length
    }

    return ok({ action, affected, ids })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro na operação em massa')
  }
})
