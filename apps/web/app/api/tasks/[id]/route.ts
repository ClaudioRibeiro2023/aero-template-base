/**
 * GET    /api/tasks/[id]  — busca task por ID
 * PUT    /api/tasks/[id]  — atualiza task
 * DELETE /api/tasks/[id]  — remove task
 *
 * Sprint 7 (P1-01): CRUD de referência.
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
import { createSupabaseCookieClient } from '@/lib/supabase-cookies'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// ── GET /api/tasks/[id] ──
export const GET = withApiLog(
  'tasks-detail',
  async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 120 })
    if (!success) return tooManyRequests()

    const supabase = await createSupabaseCookieClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const { id } = await params
    const { data, error } = await supabase
      .from('tasks')
      .select(
        'id, title, description, status, priority, assignee_id, created_by, tenant_id, created_at, updated_at'
      )
      .eq('id', id)
      .single()

    if (error?.code === 'PGRST116') return notFound()
    if (error) {
      console.error('[tasks/GET:id]', error)
      return serverError()
    }
    return ok(data)
  }
)

// ── PUT /api/tasks/[id] ──
export const PUT = withApiLog(
  'tasks-detail',
  async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const jsonError = requireJson(request)
    if (jsonError) return jsonError

    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
    if (!success) return tooManyRequests()

    const supabase = await createSupabaseCookieClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return unauthorized()

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

    const { id } = await params
    const { assignee_id, ...rest } = parsed.data
    const updatePayload = {
      ...rest,
      ...(assignee_id !== undefined ? { assignee_id: assignee_id || null } : {}),
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select(
        'id, title, description, status, priority, assignee_id, created_by, tenant_id, created_at, updated_at'
      )
      .single()

    if (error?.code === 'PGRST116') return notFound()
    if (error) {
      console.error('[tasks/PUT:id]', error)
      return serverError()
    }
    return ok(data)
  }
)

// ── DELETE /api/tasks/[id] ──
export const DELETE = withApiLog(
  'tasks-detail',
  async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
    if (!success) return tooManyRequests()

    const supabase = await createSupabaseCookieClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const { id } = await params
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) {
      console.error('[tasks/DELETE:id]', error)
      return serverError()
    }
    return noContent()
  }
)
