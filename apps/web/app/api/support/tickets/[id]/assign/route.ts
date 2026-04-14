/**
 * PUT /api/support/tickets/[id]/assign — atribui ticket a um responsável
 *
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
import { ticketAssignSchema } from '@template/shared/schemas'
import { requireJson } from '@/lib/api-guard'
import {
  ok,
  badRequest,
  unauthorized,
  notFound,
  tooManyRequests,
  serverError,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getRepository, getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode, DEMO_TICKETS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

export const PUT = withApiLog(
  'support-tickets-assign',
  async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (isDemoMode) {
      const { id } = await params
      const body = await request.json().catch(() => ({}))
      const ticket = DEMO_TICKETS.find(t => t.id === id) ?? DEMO_TICKETS[0]
      return ok({ ...ticket, id, assignee_id: body?.assignee_id, status: 'in_progress' })
    }

    const jsonError = requireJson(request)
    if (jsonError) return jsonError

    const ip = getClientIp(request.headers)
    const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
    if (!success) return tooManyRequests()

    const { user, error } = await getAuthGateway().getUser()
    if (error || !user) return unauthorized()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON body')
    }

    const parsed = ticketAssignSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
    }

    try {
      const { id } = await params
      const tickets = getRepository('tickets')
      const data = await tickets.update(id, {
        assignee_id: parsed.data.assignee_id,
        status: 'in_progress',
      })
      if (!data) return notFound()
      return ok(data)
    } catch (err) {
      console.error('[support/tickets/assign]', err)
      return serverError()
    }
  }
)
