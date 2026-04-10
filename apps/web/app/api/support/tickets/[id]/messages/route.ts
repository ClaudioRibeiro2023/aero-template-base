/**
 * GET  /api/support/tickets/[id]/messages  — lista mensagens do ticket
 * POST /api/support/tickets/[id]/messages  — cria mensagem no ticket
 */
import type { NextRequest } from 'next/server'
import { messageCreateSchema } from '@template/shared/schemas'
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

const MSG_COLUMNS = 'id, ticket_id, content, message_type, is_internal, created_by, created_at'

// ── GET /api/support/tickets/[id]/messages ──
export const GET = withApiLog(
  'support-tickets-messages',
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
      .from('support_messages')
      .select(MSG_COLUMNS)
      .eq('ticket_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[support/messages/GET]', error)
      return serverError()
    }
    return ok(data)
  }
)

// ── POST /api/support/tickets/[id]/messages ──
export const POST = withApiLog(
  'support-tickets-messages',
  async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const parsed = messageCreateSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
    }

    const { id } = await params
    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: id,
        content: parsed.data.content,
        is_internal: parsed.data.is_internal,
        message_type: parsed.data.is_internal ? 'internal_note' : 'reply',
        created_by: user.id,
      })
      .select(MSG_COLUMNS)
      .single()

    if (error) {
      console.error('[support/messages/POST]', error)
      return serverError()
    }
    return created(data)
  }
)
