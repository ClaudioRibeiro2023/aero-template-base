/**
 * GET  /api/support/tickets  — lista tickets (filtros: status, priority, category)
 * POST /api/support/tickets  — cria novo ticket
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
import { createSupabaseCookieClient } from '@/lib/supabase-cookies'

export const dynamic = 'force-dynamic'

const TICKET_COLUMNS =
  'id, title, description, status, priority, category, created_by, assignee_id, satisfaction_rating, satisfaction_comment, created_at, updated_at'

// ── GET /api/support/tickets ──
export async function GET(request: NextRequest) {
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
  const category = url.searchParams.get('category')
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '20', 10))
  )

  let query = supabase
    .from('support_tickets')
    .select(TICKET_COLUMNS, { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)
  if (category) query = query.eq('category', category)

  const { data, error, count } = await query
  if (error) {
    console.error('[support/tickets/GET]', error)
    return serverError()
  }

  return ok(data, {
    page,
    page_size: pageSize,
    total: count ?? 0,
    pages: Math.ceil((count ?? 0) / pageSize),
  })
}

// ── POST /api/support/tickets ──
export async function POST(request: NextRequest) {
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

  const parsed = ticketCreateSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      ...parsed.data,
      created_by: user.id,
    })
    .select(TICKET_COLUMNS)
    .single()

  if (error) {
    console.error('[support/tickets/POST]', error)
    return serverError()
  }
  return created(data)
}
