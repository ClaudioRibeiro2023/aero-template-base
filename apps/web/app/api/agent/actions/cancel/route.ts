/**
 * POST /api/agent/actions/cancel
 *
 * Cancela uma ação pendente do agente.
 */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthGateway } from '@/lib/data'
import { isValidTenantId } from '@/lib/agent-session-store'
import { PendingActionStore } from '@/lib/agent-pending-action-store'
import { getAgentRateLimiter } from '@/lib/agent-rate-limiter'
import { badRequest, unauthorized } from '@/lib/api-response'

const CancelSchema = z.object({
  actionId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const { user } = await getAuthGateway().getUser()
  if (!user) return unauthorized()

  const tenantId = isValidTenantId(user.tenantId) ? user.tenantId : null
  if (!tenantId) return badRequest('Cancelamento requer tenant válido')

  const limiter = getAgentRateLimiter()
  const rateCheck = limiter.check(tenantId, user.id, 'cancel')
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: { message: 'Rate limit excedido' } },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Body inválido')
  }

  const parsed = CancelSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map(i => i.message).join(', '))
  }

  const store = new PendingActionStore()
  const { error } = await store.cancel(parsed.data.actionId, user.id, tenantId)

  if (error) {
    return NextResponse.json({ ok: false, error: { message: error } }, { status: 400 })
  }

  return NextResponse.json({
    ok: true,
    data: { actionId: parsed.data.actionId, status: 'cancelled' },
  })
}
