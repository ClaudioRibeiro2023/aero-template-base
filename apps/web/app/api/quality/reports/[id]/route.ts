/**
 * GET /api/quality/reports/[id] — busca relatório de qualidade por ID
 *
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
import { ok, unauthorized, notFound, tooManyRequests, serverError } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getRepository, getAuthGateway } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  try {
    const { id } = await params
    const reports = getRepository('qualityReports')
    const data = await reports.findById(id)
    if (!data) return notFound()
    return ok(data)
  } catch (err) {
    console.error('[quality/reports/GET:id]', err)
    return serverError()
  }
}
