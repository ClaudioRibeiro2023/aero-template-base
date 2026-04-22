/**
 * GET /api/admin/agent/degradations — falhas de tool + mensagens com degraded metadata.
 * ADMIN/GESTOR. GESTOR escopado ao proprio tenant.
 */
import type { NextRequest } from 'next/server'
import { SupabaseDbClient } from '@template/data/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { ok, unauthorized, forbidden, tooManyRequests, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode } from '@/lib/demo-data'
import { sanitizeJsonPayload } from '@/lib/agent-admin-sanitize'
import { isAdminRole } from '@/lib/admin-role'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('admin-agent-degradations', async function GET(request: NextRequest) {
  if (isDemoMode) {
    return ok({
      items: [],
      total: 0,
      page: 1,
      page_size: 50,
      total_pages: 0,
    })
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
  const tool = searchParams.get('tool') ?? undefined
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
      .eq('success', false)
      .order('created_at', { ascending: false })
      .range(fromIdx, toIdx)

    if (scopedTenantId) q = q.eq('tenant_id', scopedTenantId)
    if (tool) q = q.eq('tool_name', tool)
    if (from) q = q.gte('created_at', from)
    if (to) q = q.lte('created_at', to)

    const { data, count, error } = await q
    if (error) {
      console.error('[admin/agent/degradations]', error)
      return serverError()
    }

    const items = ((data as any[] | null) ?? []).map(r => ({
      kind: 'tool_fail' as const,
      id: r.id,
      tenant_id: r.tenant_id,
      user_id: r.user_id,
      session_id: r.session_id,
      tool_name: r.tool_name,
      error_msg: r.error_msg,
      reason: r.error_msg ?? 'Falha na execucao da ferramenta',
      input: sanitizeJsonPayload(r.input),
      output: r.output ? sanitizeJsonPayload(r.output) : null,
      latency_ms: r.latency_ms,
      trace_id: r.trace_id,
      created_at: r.created_at,
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
    console.error('[admin/agent/degradations]', err)
    return serverError()
  }
})
