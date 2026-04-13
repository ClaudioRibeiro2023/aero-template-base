/**
 * POST /api/support/tickets/[id]/rate — avalia satisfação do ticket (criador apenas)
 *
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
import { ticketRateSchema } from '@template/shared/schemas'
import { requireJson } from '@/lib/api-guard'
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
  serverError,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getRepository, getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode, DEMO_TICKETS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

export const POST = withApiLog(
  'support-tickets-rate',
  async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (isDemoMode) {
      const { id } = await params
      const body = await request.json().catch(() => ({}))
      const ticket = DEMO_TICKETS.find(t => t.id === id) ?? DEMO_TICKETS[0]
      return ok({ ...ticket, id, satisfaction_rating: body?.satisfaction_rating })
    }

    const jsonError = requireJson(request)
    if (jsonError) return jsonError

    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
    if (!success) return tooManyRequests()

    const { user, error } = await getAuthGateway().getUser()
    if (error || !user) return unauthorized()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON body')
    }

    const parsed = ticketRateSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
    }

    try {
      const { id } = await params
      const tickets = getRepository('tickets')

      // Verificar se o ticket pertence ao usuário e está resolved/closed
      const ticket = await tickets.findById(id, 'id, created_by, status')
      if (!ticket) return notFound()
      if (ticket.created_by !== user.id) return forbidden('Apenas o criador pode avaliar')
      if (!['resolved', 'closed'].includes(ticket.status)) {
        return badRequest('Ticket precisa estar resolvido ou fechado para avaliação')
      }

      const data = await tickets.update(id, {
        satisfaction_rating: parsed.data.satisfaction_rating,
        satisfaction_comment: parsed.data.satisfaction_comment || null,
      })
      return ok(data)
    } catch (err) {
      console.error('[support/tickets/rate]', err)
      return serverError()
    }
  }
)
