/**
 * GET  /api/quality/reports  — lista relatórios de qualidade
 * POST /api/quality/reports  — salva novo relatório de diagnóstico
 *
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
import { qualityReportCreateSchema } from '@template/shared/schemas'
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
import { getRepository, getAuthGateway } from '@/lib/data'

export const dynamic = 'force-dynamic'

// ── GET /api/quality/reports ──
export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '10', 10))
  )

  try {
    const reports = getRepository('qualityReports')
    const result = await reports.findMany({
      sort: [{ field: 'created_at', ascending: false }],
      pagination: { page, pageSize },
    })

    return ok(result.data, {
      page,
      page_size: pageSize,
      total: result.total,
      pages: result.pages,
    })
  } catch (err) {
    console.error('[quality/reports/GET]', err)
    return serverError()
  }
}

// ── POST /api/quality/reports ──
export async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 10 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parsed = qualityReportCreateSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
  }

  try {
    const reports = getRepository('qualityReports')
    const data = await reports.create({
      overall_score: parsed.data.overall_score,
      results: parsed.data.results,
      created_by: user.id,
    })
    return created(data)
  } catch (err) {
    console.error('[quality/reports/POST]', err)
    return serverError()
  }
}
