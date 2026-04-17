/**
 * GET /api/admin/agent/metrics — overview metrics do agente.
 * ADMIN/GESTOR only. GESTOR escopado ao proprio tenant.
 *
 * Query: ?period=7d|30d|all (default 7d)
 */
import type { NextRequest } from 'next/server'
import { SupabaseDbClient } from '@template/data/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { ok, unauthorized, forbidden, tooManyRequests, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

function periodToFromIso(period: string): string | null {
  const now = Date.now()
  if (period === '30d') return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
  if (period === 'all') return null
  return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
}

export const GET = withApiLog('admin-agent-metrics', async function GET(request: NextRequest) {
  if (isDemoMode) {
    return ok({
      period: '7d',
      sessions_total: 42,
      messages_total: 318,
      tool_calls_total: 91,
      pending_actions_total: 3,
      degraded_total: 2,
      latency_avg_ms: 812,
      latency_p95_ms: 1940,
    })
  }

  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user } = await getAuthGateway().getUser()
  if (!user) return unauthorized()
  if (user.role !== 'ADMIN' && user.role !== 'GESTOR') return forbidden('Acesso restrito')

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? '7d'
  const fromIso = periodToFromIso(period)

  const db = new SupabaseDbClient()
  const client = db.asAdmin()

  // GESTOR: escopo ao proprio tenant
  let tenantFilter: string | null = null
  if (user.role === 'GESTOR') {
    const { data: profile } = await client
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    tenantFilter = (profile?.tenant_id as string | null) ?? null
    if (!tenantFilter) return forbidden('Tenant nao encontrado')
  }

  const applyScope = (q: any): any => {
    let out: any = q
    if (fromIso) out = out.gte('created_at', fromIso)
    if (tenantFilter) out = out.eq('tenant_id', tenantFilter)
    return out
  }

  try {
    const sessionsCountQ: any = applyScope(
      client.from('agent_sessions').select('id', { count: 'exact', head: true })
    )
    const messagesCountQ: any = applyScope(
      client.from('agent_messages').select('id', { count: 'exact', head: true })
    )
    const toolCallsCountQ: any = applyScope(
      client.from('agent_tool_logs').select('id', { count: 'exact', head: true })
    )
    const pendingCountQ: any = applyScope(
      client.from('agent_pending_actions').select('id', { count: 'exact', head: true })
    )

    const [sessionsRes, messagesRes, toolCallsRes, pendingRes] = await Promise.all([
      sessionsCountQ,
      messagesCountQ,
      toolCallsCountQ,
      pendingCountQ,
    ])

    // Latencias: sample de tool_logs (ate 1000)
    let latSampleQ: any = client
      .from('agent_tool_logs')
      .select('latency_ms')
      .not('latency_ms', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1000)
    if (fromIso) latSampleQ = latSampleQ.gte('created_at', fromIso)
    if (tenantFilter) latSampleQ = latSampleQ.eq('tenant_id', tenantFilter)
    const { data: latRows } = await latSampleQ

    const lats = ((latRows as Array<{ latency_ms: number | null }> | null) ?? [])
      .map(r => r.latency_ms ?? 0)
      .filter(n => n > 0)
      .sort((a, b) => a - b)
    const avg = lats.length ? Math.round(lats.reduce((s, n) => s + n, 0) / lats.length) : 0
    const p95 = lats.length ? lats[Math.min(lats.length - 1, Math.floor(lats.length * 0.95))] : 0

    // Degraded: tool_logs com success=false no periodo
    let degQ: any = client
      .from('agent_tool_logs')
      .select('id', { count: 'exact', head: true })
      .eq('success', false)
    if (fromIso) degQ = degQ.gte('created_at', fromIso)
    if (tenantFilter) degQ = degQ.eq('tenant_id', tenantFilter)
    const degRes = await degQ

    return ok({
      period,
      sessions_total: sessionsRes.count ?? 0,
      messages_total: messagesRes.count ?? 0,
      tool_calls_total: toolCallsRes.count ?? 0,
      pending_actions_total: pendingRes.count ?? 0,
      degraded_total: degRes.count ?? 0,
      latency_avg_ms: avg,
      latency_p95_ms: p95,
    })
  } catch (err) {
    console.error('[admin/agent/metrics]', err)
    return serverError()
  }
})
