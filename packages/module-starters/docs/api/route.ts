/**
 * GET  /api/docs  — metadados de documentação (versão, changelog)
 */
import type { NextRequest } from 'next/server'
import { ok, unauthorized, tooManyRequests, serverError } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('docs', async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  try {
    return ok({
      version: process.env.npm_package_version ?? '1.0.0',
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro interno')
  }
})
