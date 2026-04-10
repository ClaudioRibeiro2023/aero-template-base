/**
 * POST /api/support/tickets/[id]/rate — avalia satisfação do ticket (criador apenas)
 */
import type { NextRequest } from 'next/server'
import { ticketRateSchema } from '@template/shared/schemas'
import { requireJson } from '@/lib/api-guard'
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
  serverError,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { createSupabaseCookieClient } from '@/lib/supabase-cookies'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const parsed = ticketRateSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
  }

  const { id } = await params

  // Verificar se o ticket pertence ao usuário e está resolved/closed
  const { data: ticket, error: fetchErr } = await supabase
    .from('support_tickets')
    .select('id, created_by, status')
    .eq('id', id)
    .single()

  if (fetchErr?.code === 'PGRST116' || !ticket) return notFound()
  if (fetchErr) {
    console.error('[support/tickets/rate:fetch]', fetchErr)
    return serverError()
  }

  if (ticket.created_by !== user.id) return forbidden('Apenas o criador pode avaliar')
  if (!['resolved', 'closed'].includes(ticket.status)) {
    return badRequest('Ticket precisa estar resolvido ou fechado para avaliação')
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .update({
      satisfaction_rating: parsed.data.satisfaction_rating,
      satisfaction_comment: parsed.data.satisfaction_comment || null,
    })
    .eq('id', id)
    .select('id, satisfaction_rating, satisfaction_comment, updated_at')
    .single()

  if (error) {
    console.error('[support/tickets/rate]', error)
    return serverError()
  }
  return ok(data)
}
