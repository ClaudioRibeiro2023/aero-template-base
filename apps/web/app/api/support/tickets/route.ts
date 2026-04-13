/**
 * GET  /api/support/tickets  — lista tickets (filtros: status, priority, category)
 * POST /api/support/tickets  — cria novo ticket
 *
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
import { ticketCreateSchema } from '@template/shared/schemas'
import { requireJson } from '@/lib/api-guard'
import {
  ok,
  created,
  badRequest,
  unauthorized,
  tooManyRequests,
  serverError,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getRepository, getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode, DEMO_TICKETS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

// ── GET /api/support/tickets ──
export const GET = withApiLog('support-tickets', async function GET(request: NextRequest) {
  if (isDemoMode) {
    return ok(DEMO_TICKETS, {
      page: 1,
      page_size: 20,
      total: DEMO_TICKETS.length,
      pages: 1,
    })
  }

  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 120 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const priority = url.searchParams.get('priority')
  const category = url.searchParams.get('category')
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '20', 10))
  )

  try {
    const tickets = getRepository('tickets')
    const result = await tickets.findMany({
      filters: [
        ...(status ? [{ field: 'status', operator: 'eq' as const, value: status }] : []),
        ...(priority ? [{ field: 'priority', operator: 'eq' as const, value: priority }] : []),
        ...(category ? [{ field: 'category', operator: 'eq' as const, value: category }] : []),
      ],
      sort: [{ field: 'updated_at', ascending: false }],
      pagination: { page, pageSize },
    })

    return ok(result.data, {
      page,
      page_size: pageSize,
      total: result.total,
      pages: result.pages,
    })
  } catch (err) {
    console.error('[support/tickets/GET]', err)
    return serverError()
  }
})

// ── POST /api/support/tickets ──
export const POST = withApiLog('support-tickets', async function POST(request: NextRequest) {
  if (isDemoMode) {
    const body = await request.json().catch(() => ({}))
    return created({
      id: `demo-ticket-${Date.now()}`,
      ...body,
      status: 'open',
      created_by: 'demo-user-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
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

  const parsed = ticketCreateSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
  }

  try {
    const tickets = getRepository('tickets')
    const data = await tickets.create({
      ...parsed.data,
      created_by: user.id,
    })
    return created(data)
  } catch (err) {
    console.error('[support/tickets/POST]', err)
    return serverError()
  }
})
