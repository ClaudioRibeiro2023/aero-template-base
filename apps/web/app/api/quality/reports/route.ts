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
import { isDemoMode, DEMO_QUALITY_REPORTS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

// ── GET /api/quality/reports ──
export async function GET(request: NextRequest) {
  if (isDemoMode) {
    return ok(DEMO_QUALITY_REPORTS, {
      page: 1,
      page_size: 10,
      total: DEMO_QUALITY_REPORTS.length,
      pages: 1,
    })
  }

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
  if (isDemoMode) {
    const body = await request.json().catch(() => ({}))
    return created({
      id: `demo-report-${Date.now()}`,
      ...body,
      created_by: 'demo-user-001',
      created_at: new Date().toISOString(),
    })
  }

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
