/**
 * GET /api/quality/reports/[id] — busca relatório de qualidade por ID
 */
import type { NextRequest } from 'next/server'
import { ok, unauthorized, notFound, tooManyRequests, serverError } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { createSupabaseCookieClient } from '@/lib/supabase-cookies'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const supabase = await createSupabaseCookieClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { id } = await params
  const { data, error } = await supabase
    .from('quality_reports')
    .select('id, overall_score, results, created_by, created_at')
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116') return notFound()
  if (error) {
    console.error('[quality/reports/GET:id]', error)
    return serverError()
  }
  return ok(data)
}
