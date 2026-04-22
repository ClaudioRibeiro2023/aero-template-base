/**
 * GET  /api/observability  — métricas, logs e health agregados
 * Apenas admins e gestores têm acesso.
 */
import type { NextRequest } from 'next/server'
import { ok, unauthorized, forbidden, tooManyRequests, serverError } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('observability', async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  // Apenas ADMIN e GESTOR
  const role = (user as { role?: string }).role
  if (!role || !['ADMIN', 'GESTOR'].includes(role)) return forbidden()

  const url = new URL(request.url)
  const view = url.searchParams.get('view') ?? 'metrics' // metrics | logs | health

  try {
    switch (view) {
      case 'health':
        // TODO: checar conectividade Supabase, Redis, etc.
        return ok({
          status: 'ok',
          services: { supabase: 'ok', cache: 'ok' },
          checkedAt: new Date().toISOString(),
        })
      case 'logs':
        // TODO: buscar app_logs com filtros
        return ok({ logs: [], total: 0 })
      case 'metrics':
      default:
        // TODO: buscar app_metrics agregadas
        return ok({ metrics: {}, period: '24h' })
    }
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro interno')
  }
})
