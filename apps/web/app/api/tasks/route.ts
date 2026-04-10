/**
 * GET  /api/tasks     — lista tasks do usuário autenticado
 * POST /api/tasks     — cria nova task
 *
 * Sprint 7 (P1-01): CRUD de referência com Supabase real.
 * Demonstra: server client, RLS, Zod validation, ApiResponse padrão.
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
import { createSupabaseCookieClient } from '@/lib/supabase-cookies'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// ── GET /api/tasks ──
export const GET = withApiLog('tasks', async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 120 })
  if (!success) return tooManyRequests()

  const supabase = await createSupabaseCookieClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const priority = url.searchParams.get('priority')
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '20', 10))
  )

  let query = supabase
    .from('tasks')
    .select(
      'id, title, description, status, priority, assignee_id, created_by, tenant_id, created_at, updated_at',
      { count: 'exact' }
    )
    .order('updated_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)

  const { data, error, count } = await query
  if (error) {
    console.error('[tasks/GET]', error)
    return serverError()
  }

  return ok(data, {
    page,
    page_size: pageSize,
    total: count ?? 0,
    pages: Math.ceil((count ?? 0) / pageSize),
  })
})

// ── POST /api/tasks ──
export const POST = withApiLog('tasks', async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
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

  const parsed = taskCreateSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
  }

  const { assignee_id, ...rest } = parsed.data
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...rest,
      assignee_id: assignee_id || null,
      created_by: user.id,
    })
    .select(
      'id, title, description, status, priority, assignee_id, created_by, tenant_id, created_at, updated_at'
    )
    .single()

  if (error) {
    console.error('[tasks/POST]', error)
    return serverError()
  }
  return created(data)
})
