/**
 * GET /api/admin/agent/tool-logs — paginado com filtros.
 * ADMIN/GESTOR. GESTOR escopado ao proprio tenant.
 * Input/output sao sanitizados antes do retorno.
 */
import type { NextRequest } from 'next/server'
import { SupabaseDbClient } from '@template/data/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { ok, unauthorized, forbidden, tooManyRequests, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode } from '@/lib/demo-data'
import { sanitizeJsonPayload } from '@/lib/agent-admin-sanitize'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('admin-agent-tool-logs', async function GET(request: NextRequest) {
  if (isDemoMode) {
    return ok({ items: [], total: 0, page: 1, page_size: 50, total_pages: 0 })
  }

  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user } = await getAuthGateway().getUser()
  if (!user) return unauthorized()
  if (user.role !== 'ADMIN' && user.role !== 'GESTOR') return forbidden('Acesso restrito')

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get('page_size') ?? '50', 10)))
  const tool = searchParams.get('tool') ?? undefined
  const statusFilter = searchParams.get('status') ?? undefined // 'success' | 'fail'
  const tenantIdParam = searchParams.get('tenant_id') ?? undefined
  const userIdParam = searchParams.get('user_id') ?? undefined
  const from = searchParams.get('from') ?? undefined
  const to = searchParams.get('to') ?? undefined

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
      .from('agent_tool_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(fromIdx, toIdx)

    if (scopedTenantId) q = q.eq('tenant_id', scopedTenantId)
    if (userIdParam) q = q.eq('user_id', userIdParam)
    if (tool) q = q.eq('tool_name', tool)
    if (statusFilter === 'success') q = q.eq('success', true)
    if (statusFilter === 'fail') q = q.eq('success', false)
    if (from) q = q.gte('created_at', from)
    if (to) q = q.lte('created_at', to)

    const { data, count, error } = await q
    if (error) {
      console.error('[admin/agent/tool-logs]', error)
      return serverError()
    }

    const items = ((data as any[] | null) ?? []).map(r => ({
      ...r,
      input: sanitizeJsonPayload(r.input),
      output: r.output ? sanitizeJsonPayload(r.output) : null,
    }))
    const total = count ?? 0

    return ok({
      items,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.max(1, Math.ceil(total / pageSize)),
    })
  } catch (err) {
    console.error('[admin/agent/tool-logs]', err)
    return serverError()
  }
})
