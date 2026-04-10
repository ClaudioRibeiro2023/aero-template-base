/**
 * GET /api/audit-logs — lista audit logs paginado com filtros
 * ADMIN only.
 */
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/app/lib/supabase-server'
import { ok, unauthorized, forbidden, tooManyRequests } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getAuthUser } from '@/lib/auth-guard'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('audit-logs', async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthUser()
  if (error || !user) return unauthorized()
  if (user.role !== 'ADMIN') return forbidden()

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') ?? undefined
  const resource = searchParams.get('resource') ?? undefined
  const userId = searchParams.get('user_id') ?? undefined
  const dateFrom = searchParams.get('date_from') ?? undefined
  const dateTo = searchParams.get('date_to') ?? undefined
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('page_size') ?? '50', 10)))

  const supabase = createServerSupabase()

  let query = supabase
    .from('audit_logs')
    .select('id, user_id, action, resource, resource_id, ip_address, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (action) query = query.eq('action', action)
  if (resource) {
    const safeResource = resource.replace(/[,.()"'\\%]/g, '')
    if (safeResource) query = query.ilike('resource', `%${safeResource}%`)
  }
  if (userId) query = query.eq('user_id', userId)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)

  const { data, count, error: dbError } = await query

  if (dbError) {
    // audit_logs pode nao existir — retornar lista vazia
    return ok({ items: [], total: 0, page, page_size: pageSize, total_pages: 0 })
  }

  return ok({
    items: data ?? [],
    total: count ?? 0,
    page,
    page_size: pageSize,
    total_pages: Math.ceil((count ?? 0) / pageSize),
  })
})
