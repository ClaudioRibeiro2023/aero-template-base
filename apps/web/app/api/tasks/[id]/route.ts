/**
 * GET    /api/tasks/[id]  — busca task por ID
 * PUT    /api/tasks/[id]  — atualiza task
 * DELETE /api/tasks/[id]  — remove task
 *
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
import { taskUpdateSchema } from '@template/shared/schemas'
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
import { isDemoMode, DEMO_TASKS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

// ── GET /api/tasks/[id] ──
export const GET = withApiLog(
  'tasks-detail',
  async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (isDemoMode) {
      const { id } = await params
      const task = DEMO_TASKS.find(t => t.id === id) ?? { ...DEMO_TASKS[0], id }
      return ok(task)
    }

    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 120 })
    if (!success) return tooManyRequests()

    const { user, error } = await getAuthGateway().getUser()
    if (error || !user) return unauthorized()

    try {
      const { id } = await params
      const tasks = getRepository('tasks')
      const data = await tasks.findById(id)
      if (!data) return notFound()
      return ok(data)
    } catch (err) {
      console.error('[tasks/GET:id]', err)
      return serverError()
    }
  }
)

// ── PUT /api/tasks/[id] ──
export const PUT = withApiLog(
  'tasks-detail',
  async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (isDemoMode) {
      const { id } = await params
      const body = await request.json().catch(() => ({}))
      const task = DEMO_TASKS.find(t => t.id === id) ?? DEMO_TASKS[0]
      return ok({ ...task, ...body, id, updated_at: new Date().toISOString() })
    }

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

    const parsed = taskUpdateSchema.safeParse(body)
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

      const tasks = getRepository('tasks')
      const data = await tasks.update(id, updatePayload)
      if (!data) return notFound()
      return ok(data)
    } catch (err) {
      console.error('[tasks/PUT:id]', err)
      return serverError()
    }
  }
)

// ── DELETE /api/tasks/[id] ──
export const DELETE = withApiLog(
  'tasks-detail',
  async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (isDemoMode) return noContent()

    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
    if (!success) return tooManyRequests()

    const { user, error } = await getAuthGateway().getUser()
    if (error || !user) return unauthorized()

    try {
      const { id } = await params
      const tasks = getRepository('tasks')
      await tasks.delete(id)
      return noContent()
    } catch (err) {
      console.error('[tasks/DELETE:id]', err)
      return serverError()
    }
  }
)
