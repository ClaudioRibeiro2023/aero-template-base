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
import { isAdminRole } from '@/lib/admin-role'

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
      by_pack: [
        {
          pack_id: 'core',
          sessions_count: 42,
          tool_calls_count: 91,
          fallback_count: 2,
          avg_latency_ms: 812,
        },
      ],
    })
  }

  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user } = await getAuthGateway().getUser()
  if (!user) return unauthorized()
  if (!isAdminRole(user.role)) return forbidden('Acesso restrito')

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

    // ─── byPack aggregation (Sprint 10) ─────────────────────────────────────
    // Pragmático: busca sessões do período (cap 5000) + tool_logs + messages,
    // agrupa em JS. Suficiente para painel admin; não é trace analítico.
    const PACK_CAP = 5000
    let packSessQ: any = client
      .from('agent_sessions')
      .select('id, domain_pack_id, domain_pack_fallback')
      .order('last_active_at', { ascending: false })
      .limit(PACK_CAP)
    if (fromIso) packSessQ = packSessQ.gte('created_at', fromIso)
    if (tenantFilter) packSessQ = packSessQ.eq('tenant_id', tenantFilter)
    const { data: packSessRows } = await packSessQ

    const packSessions =
      (packSessRows as Array<{
        id: string
        domain_pack_id: string | null
        domain_pack_fallback: boolean | null
      }> | null) ?? []

    type PackBucket = {
      packId: string | null
      sessionsCount: number
      toolCallsCount: number
      fallbackCount: number
      latencySum: number
      latencyN: number
    }
    const buckets = new Map<string, PackBucket>()
    const sessionToPack = new Map<string, string | null>()

    for (const s of packSessions) {
      const key = s.domain_pack_id ?? '__legacy__'
      sessionToPack.set(s.id, s.domain_pack_id ?? null)
      let b = buckets.get(key)
      if (!b) {
        b = {
          packId: s.domain_pack_id ?? null,
          sessionsCount: 0,
          toolCallsCount: 0,
          fallbackCount: 0,
          latencySum: 0,
          latencyN: 0,
        }
        buckets.set(key, b)
      }
      b.sessionsCount++
      if (s.domain_pack_fallback === true) b.fallbackCount++
    }

    if (packSessions.length > 0) {
      const sessionIds = packSessions.map(s => s.id)
      // Tool calls por session
      let tlQ: any = client
        .from('agent_tool_logs')
        .select('session_id')
        .in('session_id', sessionIds)
        .limit(PACK_CAP * 4)
      if (fromIso) tlQ = tlQ.gte('created_at', fromIso)
      const { data: tlRows } = await tlQ
      for (const r of (tlRows as Array<{ session_id: string | null }>) ?? []) {
        if (!r.session_id) continue
        const packId = sessionToPack.get(r.session_id)
        if (packId === undefined) continue
        const key = packId ?? '__legacy__'
        const b = buckets.get(key)
        if (b) b.toolCallsCount++
      }

      // Latência média por pack (agent_messages.latency_ms)
      let mQ: any = client
        .from('agent_messages')
        .select('session_id, latency_ms')
        .in('session_id', sessionIds)
        .not('latency_ms', 'is', null)
        .limit(PACK_CAP * 4)
      if (fromIso) mQ = mQ.gte('created_at', fromIso)
      const { data: mRows } = await mQ
      for (const r of (mRows as Array<{ session_id: string; latency_ms: number | null }>) ?? []) {
        const packId = sessionToPack.get(r.session_id)
        if (packId === undefined) continue
        const key = packId ?? '__legacy__'
        const b = buckets.get(key)
        if (b && typeof r.latency_ms === 'number') {
          b.latencySum += r.latency_ms
          b.latencyN++
        }
      }
    }

    const byPack = Array.from(buckets.values())
      .map(b => ({
        pack_id: b.packId,
        sessions_count: b.sessionsCount,
        tool_calls_count: b.toolCallsCount,
        fallback_count: b.fallbackCount,
        avg_latency_ms: b.latencyN > 0 ? Math.round(b.latencySum / b.latencyN) : null,
      }))
      .sort((a, b) => b.sessions_count - a.sessions_count)

    return ok({
      period,
      sessions_total: sessionsRes.count ?? 0,
      messages_total: messagesRes.count ?? 0,
      tool_calls_total: toolCallsRes.count ?? 0,
      pending_actions_total: pendingRes.count ?? 0,
      degraded_total: degRes.count ?? 0,
      latency_avg_ms: avg,
      latency_p95_ms: p95,
      by_pack: byPack,
    })
  } catch (err) {
    console.error('[admin/agent/metrics]', err)
    return serverError()
  }
})
