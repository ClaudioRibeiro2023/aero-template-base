/**
 * GET  /api/lgpd  — retorna status de consentimentos do usuário autenticado
 * POST /api/lgpd  — registra consentimento ou solicita exportação/exclusão de dados
 */
import type { NextRequest } from 'next/server'
import { z } from 'zod'
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
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const consentSchema = z.object({
  type: z.enum(['consent', 'export_request', 'deletion_request']),
  consents: z.record(z.boolean()).optional(),
  reason: z.string().optional(),
})

export const GET = withApiLog('lgpd', async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  try {
    // TODO: buscar consent_records e data_export_requests do usuário
    return ok({ consents: {}, exportRequests: [], deletionRequests: [] })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro interno')
  }
})

export const POST = withApiLog('lgpd', async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 5 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const body = await requireJson(request)
  if (!body) return badRequest('Body inválido')

  const parsed = consentSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.message)

  try {
    // TODO: persistir consentimento ou criar request de exportação/exclusão
    const record = {
      id: crypto.randomUUID(),
      userId: user.id,
      ...parsed.data,
      createdAt: new Date().toISOString(),
    }
    return created(record)
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro interno')
  }
})
