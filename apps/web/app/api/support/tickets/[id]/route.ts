/**
 * GET    /api/support/tickets/[id]  — busca ticket por ID
 * PUT    /api/support/tickets/[id]  — atualiza ticket
 * DELETE /api/support/tickets/[id]  — remove ticket
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
import { createSupabaseCookieClient } from '@/lib/supabase-cookies'

export const dynamic = 'force-dynamic'

const TICKET_COLUMNS =
  'id, title, description, status, priority, category, created_by, assignee_id, satisfaction_rating, satisfaction_comment, created_at, updated_at'

// ── GET /api/support/tickets/[id] ──
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    .from('support_tickets')
    .select(TICKET_COLUMNS)
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116') return notFound()
  if (error) {
    console.error('[support/tickets/GET:id]', error)
    return serverError()
  }
  return ok(data)
}

// ── PUT /api/support/tickets/[id] ──
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const parsed = ticketUpdateSchema.safeParse(body)
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
    .from('support_tickets')
    .update(updatePayload)
    .eq('id', id)
    .select(TICKET_COLUMNS)
    .single()

  if (error?.code === 'PGRST116') return notFound()
  if (error) {
    console.error('[support/tickets/PUT:id]', error)
    return serverError()
  }
  return ok(data)
}

// ── DELETE /api/support/tickets/[id] ──
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const supabase = await createSupabaseCookieClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { id } = await params
  const { error } = await supabase.from('support_tickets').delete().eq('id', id)

  if (error) {
    console.error('[support/tickets/DELETE:id]', error)
    return serverError()
  }
  return noContent()
}
