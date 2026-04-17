/**
 * GET /api/admin/agent/sessions/[id] — detalhe de sessao + mensagens + tool logs + pending actions.
 * ADMIN/GESTOR. GESTOR escopado ao proprio tenant.
 */
import type { NextRequest } from 'next/server'
import { SupabaseDbClient } from '@template/data/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
  serverError,
} from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode } from '@/lib/demo-data'
import { sanitizeJsonPayload } from '@/lib/agent-admin-sanitize'

export const dynamic = 'force-dynamic'

export const GET = withApiLog(
  'admin-agent-session-detail',
  async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    if (isDemoMode) {
      return ok({ session: null, messages: [], tool_logs: [], pending_actions: [] })
    }

    const ip = getClientIp(request.headers)
    const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
    if (!success) return tooManyRequests()

    const { user } = await getAuthGateway().getUser()
    if (!user) return unauthorized()
    if (user.role !== 'ADMIN' && user.role !== 'GESTOR') return forbidden('Acesso restrito')

    const { id } = await ctx.params
    if (!id) return notFound('Sessao nao encontrada')

    const db = new SupabaseDbClient()
    const client = db.asAdmin()

    let gestorTenantId: string | null = null
    if (user.role === 'GESTOR') {
      const { data: profile } = await client
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()
      gestorTenantId = (profile?.tenant_id as string | null) ?? null
      if (!gestorTenantId) return forbidden('Tenant nao encontrado')
    }

    try {
      const { data: session, error: sessErr } = await client
        .from('agent_sessions')
        .select('*')
        .eq('id', id)
        .single()
      if (sessErr || !session) return notFound('Sessao nao encontrada')

      if (gestorTenantId && session.tenant_id !== gestorTenantId) {
        return forbidden('Sessao fora do escopo do tenant')
      }

      const [messagesRes, toolLogsRes, pendingRes] = await Promise.all([
        client
          .from('agent_messages')
          .select('*')
          .eq('session_id', id)
          .order('created_at', { ascending: true })
          .limit(500),
        client
          .from('agent_tool_logs')
          .select('*')
          .eq('session_id', id)
          .order('created_at', { ascending: true })
          .limit(500),
        client
          .from('agent_pending_actions')
          .select('*')
          .eq('session_id', id)
          .order('created_at', { ascending: false })
          .limit(200),
      ])

      const messages = (messagesRes.data ?? []).map((m: any) => ({
        ...m,
        tool_calls: m.tool_calls ? sanitizeJsonPayload(m.tool_calls) : null,
      }))

      const toolLogs = (toolLogsRes.data ?? []).map((t: any) => ({
        ...t,
        input: sanitizeJsonPayload(t.input),
        output: t.output ? sanitizeJsonPayload(t.output) : null,
      }))

      const pendingActions = (pendingRes.data ?? []).map((p: any) => ({
        ...p,
        proposed_input: sanitizeJsonPayload(p.proposed_input),
        result: p.result ? sanitizeJsonPayload(p.result) : null,
      }))

      return ok({
        session,
        messages,
        tool_logs: toolLogs,
        pending_actions: pendingActions,
      })
    } catch (err) {
      console.error('[admin/agent/sessions/[id]]', err)
      return serverError()
    }
  }
)
