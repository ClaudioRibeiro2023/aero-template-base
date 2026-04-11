/**
 * GET    /api/support/tickets/[id]  — busca ticket por ID
 * PUT    /api/support/tickets/[id]  — atualiza ticket
 * DELETE /api/support/tickets/[id]  — remove ticket
 *
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
import { ticketUpdateSchema } from '@template/shared/schemas'
import { requireJson } from '@/lib/api-guard'
import {
  ok,
  noContent,
  badRequest,
  unauthorized,
  notFound,
  tooManyRequests,
  serverError,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getRepository, getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// ── GET /api/support/tickets/[id] ──
export const GET = withApiLog(
  'support-tickets-detail',
  async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 120 })
    if (!success) return tooManyRequests()

    const { user, error } = await getAuthGateway().getUser()
    if (error || !user) return unauthorized()

    try {
      const { id } = await params
      const tickets = getRepository('tickets')
      const data = await tickets.findById(id)
      if (!data) return notFound()
      return ok(data)
    } catch (err) {
      console.error('[support/tickets/GET:id]', err)
      return serverError()
    }
  }
)

// ── PUT /api/support/tickets/[id] ──
export const PUT = withApiLog(
  'support-tickets-detail',
  async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const jsonError = requireJson(request)
    if (jsonError) return jsonError

    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
    if (!success) return tooManyRequests()

    const { user, error } = await getAuthGateway().getUser()
    if (error || !user) return unauthorized()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('Invalid JSON body')
    }

    const parsed = ticketUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
    }

    try {
      const { id } = await params
      const { assignee_id, ...rest } = parsed.data
      const updatePayload = {
        ...rest,
        ...(assignee_id !== undefined ? { assignee_id: assignee_id || null } : {}),
      }

      const tickets = getRepository('tickets')
      const data = await tickets.update(id, updatePayload)
      if (!data) return notFound()
      return ok(data)
    } catch (err) {
      console.error('[support/tickets/PUT:id]', err)
      return serverError()
    }
  }
)

// ── DELETE /api/support/tickets/[id] ──
export const DELETE = withApiLog(
  'support-tickets-detail',
  async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
    if (!success) return tooManyRequests()

    const { user, error } = await getAuthGateway().getUser()
    if (error || !user) return unauthorized()

    try {
      const { id } = await params
      const tickets = getRepository('tickets')
      await tickets.delete(id)
      return noContent()
    } catch (err) {
      console.error('[support/tickets/DELETE:id]', err)
      return serverError()
    }
  }
)
