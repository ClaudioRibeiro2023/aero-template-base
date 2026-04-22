/**
 * GET /api/admin/agent/sessions — lista paginada de sessoes.
 * ADMIN/GESTOR. GESTOR escopado ao proprio tenant.
 */
import type { NextRequest } from 'next/server'
import { SupabaseDbClient } from '@template/data/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { ok, unauthorized, forbidden, tooManyRequests, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode } from '@/lib/demo-data'
import { isAdminRole } from '@/lib/admin-role'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('admin-agent-sessions', async function GET(request: NextRequest) {
  if (isDemoMode) {
    return ok({ items: [], total: 0, page: 1, page_size: 50, total_pages: 0 })
  }

  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user } = await getAuthGateway().getUser()
  if (!user) return unauthorized()
  if (!isAdminRole(user.role)) return forbidden('Acesso restrito')

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('page_size') ?? '50', 10)))
  const tenantIdParam = searchParams.get('tenant_id') ?? undefined
  const userIdParam = searchParams.get('user_id') ?? undefined
  const status = searchParams.get('status') ?? undefined
  const from = searchParams.get('from') ?? undefined
  const to = searchParams.get('to') ?? undefined
  const domainPackId = searchParams.get('domain_pack_id') ?? undefined
  const domainPackFallbackRaw = searchParams.get('domain_pack_fallback')
  const domainPackFallback =
    domainPackFallbackRaw === 'true' ? true : domainPackFallbackRaw === 'false' ? false : undefined
  const domainPackLegacy = searchParams.get('domain_pack_legacy') === 'true'

  const db = new SupabaseDbClient()
  const client = db.asAdmin()

  let scopedTenantId: string | null = tenantIdParam ?? null
  if (user.role === 'GESTOR') {
    const { data: profile } = await client
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    scopedTenantId = (profile?.tenant_id as string | null) ?? null
    if (!scopedTenantId) return forbidden('Tenant nao encontrado')
  }

  const fromIdx = (page - 1) * pageSize
  const toIdx = fromIdx + pageSize - 1

  try {
    let q: any = client
      .from('agent_sessions')
      .select(
        'id, tenant_id, user_id, app_id, status, title, turn_count, metadata, started_at, last_active_at, created_at, domain_pack_id, domain_pack_version, domain_pack_fallback, domain_pack_strategy',
        { count: 'exact' }
      )
      .order('last_active_at', { ascending: false })
      .range(fromIdx, toIdx)

    if (scopedTenantId) q = q.eq('tenant_id', scopedTenantId)
    if (userIdParam) q = q.eq('user_id', userIdParam)
    if (status) q = q.eq('status', status)
    if (from) q = q.gte('created_at', from)
    if (to) q = q.lte('created_at', to)
    if (domainPackId) q = q.eq('domain_pack_id', domainPackId)
    if (domainPackFallback !== undefined) q = q.eq('domain_pack_fallback', domainPackFallback)
    if (domainPackLegacy) q = q.is('domain_pack_id', null)

    const { data, count, error } = await q
    if (error) {
      console.error('[admin/agent/sessions]', error)
      return serverError()
    }

    const total = count ?? 0
    return ok({
      items: data ?? [],
      total,
      page,
      page_size: pageSize,
      total_pages: Math.max(1, Math.ceil(total / pageSize)),
    })
  } catch (err) {
    console.error('[admin/agent/sessions]', err)
    return serverError()
  }
})
