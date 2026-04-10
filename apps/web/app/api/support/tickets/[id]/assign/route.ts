/**
 * PUT /api/support/tickets/[id]/assign — atribui ticket a um responsável
 */
import type { NextRequest } from 'next/server'
import { ticketAssignSchema } from '@template/shared/schemas'
import { requireJson } from '@/lib/api-guard'
import {
  ok,
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

export const PUT = withApiLog(
  'support-tickets-assign',
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

    const parsed = ticketAssignSchema.safeParse(body)
    if (!parsed.success) {
      return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
    }

    const { id } = await params
    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        assignee_id: parsed.data.assignee_id,
        status: 'in_progress',
      })
      .eq('id', id)
      .select('id, title, status, assignee_id, updated_at')
      .single()

    if (error?.code === 'PGRST116') return notFound()
    if (error) {
      console.error('[support/tickets/assign]', error)
      return serverError()
    }
    return ok(data)
  }
)
