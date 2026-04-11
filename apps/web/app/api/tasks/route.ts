/**
 * GET  /api/tasks     — lista tasks do usuário autenticado
 * POST /api/tasks     — cria nova task
 *
 * Sprint 7 (P1-01): CRUD de referência com Supabase real.
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
import { taskCreateSchema } from '@template/shared/schemas'
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

export const dynamic = 'force-dynamic'

// ── GET /api/tasks ──
export const GET = withApiLog('tasks', async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 120 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const priority = url.searchParams.get('priority')
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '20', 10))
  )

  try {
    const tasks = getRepository('tasks')
    const result = await tasks.findMany({
      filters: [
        ...(status ? [{ field: 'status', operator: 'eq' as const, value: status }] : []),
        ...(priority ? [{ field: 'priority', operator: 'eq' as const, value: priority }] : []),
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
    console.error('[tasks/GET]', err)
    return serverError()
  }
})

// ── POST /api/tasks ──
export const POST = withApiLog('tasks', async function POST(request: NextRequest) {
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

  const parsed = taskCreateSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
  }

  try {
    const tasks = getRepository('tasks')
    const { assignee_id, ...rest } = parsed.data
    const data = await tasks.create({
      ...rest,
      assignee_id: assignee_id || null,
      created_by: user.id,
    })
    return created(data)
  } catch (err) {
    console.error('[tasks/POST]', err)
    return serverError()
  }
})
