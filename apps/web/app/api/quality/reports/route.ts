/**
 * GET  /api/quality/reports  — lista relatórios de qualidade (admin only)
 * POST /api/quality/reports  — salva novo relatório de diagnóstico
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
import { createSupabaseCookieClient } from '@/lib/supabase-cookies'

export const dynamic = 'force-dynamic'

const REPORT_COLUMNS = 'id, overall_score, results, created_by, created_at'

// ── GET /api/quality/reports ──
export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const supabase = await createSupabaseCookieClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '10', 10))
  )

  const { data, error, count } = await supabase
    .from('quality_reports')
    .select(REPORT_COLUMNS, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) {
    console.error('[quality/reports/GET]', error)
    return serverError()
  }

  return ok(data, {
    page,
    page_size: pageSize,
    total: count ?? 0,
    pages: Math.ceil((count ?? 0) / pageSize),
  })
}

// ── POST /api/quality/reports ──
export async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 10 })
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

  const parsed = qualityReportCreateSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
  }

  const { data, error } = await supabase
    .from('quality_reports')
    .insert({
      overall_score: parsed.data.overall_score,
      results: parsed.data.results,
      created_by: user.id,
    })
    .select(REPORT_COLUMNS)
    .single()

  if (error) {
    console.error('[quality/reports/POST]', error)
    return serverError()
  }
  return created(data)
}
