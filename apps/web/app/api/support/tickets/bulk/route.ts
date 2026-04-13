/**
 * POST /api/support/tickets/bulk — Operações em massa em tickets
 *
 * Body: { action: 'close' | 'reassign', ids: string[], assignee_id?: string }
 *
 * v3.0: Usa SupabaseDbClient para batch update via .in()
 */
import type { NextRequest } from 'next/server'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { SupabaseDbClient } from '@template/data/supabase'
import { withApiLog } from '@/lib/logger'
import { auditLog } from '@/lib/audit-log'
import { isDemoMode } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

const VALID_ACTIONS = ['close', 'reassign'] as const
type BulkAction = (typeof VALID_ACTIONS)[number]

export const POST = withApiLog('tickets-bulk', async function POST(request: NextRequest) {
  if (isDemoMode) {
    const body = await request.json().catch(() => ({}))
    return ok({
      action: body?.action ?? 'close',
      affected: body?.ids?.length ?? 0,
      ids: body?.ids ?? [],
    })
  }

  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const { user, error } = await getAuthGateway().getUser()
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
    const db = new SupabaseDbClient()
    const client = await db.asUser()
    let affected = 0

    if (action === 'close') {
      const { count, error: updateError } = await client
        .from('support_tickets')
        .update({ status: 'closed', updated_at: new Date().toISOString() })
        .in('id', ids)

      if (updateError) throw updateError
      affected = count ?? ids.length
    }

    if (action === 'reassign') {
      const assigneeId = body.assignee_id as string | undefined
      if (!assigneeId) return badRequest('assignee_id é obrigatório para reassign')

      const { count, error: updateError } = await client
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

    const auditAction = action === 'close' ? 'BULK_CLOSE' : 'BULK_REASSIGN'
    await auditLog({
      userId: user.id,
      action: auditAction,
      resource: 'support_tickets',
      details: {
        ids,
        affected,
        ...(action === 'reassign' ? { assignee_id: body.assignee_id } : {}),
      },
    })

    return ok({ action, affected, ids })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro na operação em massa')
  }
})
