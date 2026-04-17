/**
 * useAdminAgent — hooks de observabilidade do agente (admin).
 * ADMIN/GESTOR. Read-only.
 */
import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/lib/fetch-json'

// ── Types ──

export interface AdminAgentMetrics {
  period: string
  sessions_total: number
  messages_total: number
  tool_calls_total: number
  pending_actions_total: number
  degraded_total: number
  latency_avg_ms: number
  latency_p95_ms: number
}

export interface AdminAgentSession {
  id: string
  tenant_id: string
  user_id: string
  app_id: string
  status: string
  title: string | null
  turn_count: number
  metadata: Record<string, unknown> | null
  started_at: string
  last_active_at: string
  created_at: string
}

export interface AdminAgentMessage {
  id: string
  session_id: string
  tenant_id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  tool_calls: unknown
  tool_call_id: string | null
  tokens_used: number | null
  latency_ms: number | null
  model: string | null
  trace_id: string | null
  created_at: string
  metadata?: Record<string, unknown> | null
}

export interface AdminAgentToolLog {
  id: string
  trace_id: string
  session_id: string | null
  tenant_id: string
  user_id: string | null
  tool_name: string
  input: unknown
  output: unknown
  success: boolean
  error_msg: string | null
  latency_ms: number | null
  user_role: string | null
  app_id: string | null
  created_at: string
}

export interface AdminAgentPendingAction {
  id: string
  session_id: string
  tenant_id: string
  user_id: string
  app_id: string
  tool_name: string
  proposed_input: unknown
  description: string
  impact: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'executed'
  nonce: string
  expires_at: string
  created_at: string
  confirmed_at: string | null
  executed_at: string | null
  result: unknown
  error_msg: string | null
  trace_id: string | null
}

export interface AdminAgentDegradation {
  kind: 'tool_fail'
  id: string
  tenant_id: string
  user_id: string | null
  session_id: string | null
  tool_name: string
  error_msg: string | null
  reason: string
  input: unknown
  output: unknown
  latency_ms: number | null
  trace_id: string | null
  created_at: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface SessionDetail {
  session: AdminAgentSession
  messages: AdminAgentMessage[]
  tool_logs: AdminAgentToolLog[]
  pending_actions: AdminAgentPendingAction[]
}

// ── Filters ──

export interface SessionsFilters {
  page?: number
  page_size?: number
  tenant_id?: string
  user_id?: string
  status?: string
  from?: string
  to?: string
}

export interface ToolLogsFilters {
  page?: number
  page_size?: number
  tool?: string
  status?: 'success' | 'fail'
  tenant_id?: string
  user_id?: string
  from?: string
  to?: string
}

export interface PendingActionsFilters {
  page?: number
  page_size?: number
  status?: string
  tool?: string
  tenant_id?: string
  user_id?: string
  from?: string
  to?: string
}

export interface DegradationsFilters {
  page?: number
  page_size?: number
  tenant_id?: string
  tool?: string
  from?: string
  to?: string
}

// ── Query keys ──

export const adminAgentKeys = {
  all: ['admin-agent'] as const,
  metrics: (period: string) => [...adminAgentKeys.all, 'metrics', period] as const,
  sessions: (f: SessionsFilters) => [...adminAgentKeys.all, 'sessions', f] as const,
  session: (id: string) => [...adminAgentKeys.all, 'session', id] as const,
  toolLogs: (f: ToolLogsFilters) => [...adminAgentKeys.all, 'tool-logs', f] as const,
  pending: (f: PendingActionsFilters) => [...adminAgentKeys.all, 'pending', f] as const,
  degradations: (f: DegradationsFilters) => [...adminAgentKeys.all, 'degradations', f] as const,
}

// ── Helpers ──

function buildParams(filters: Record<string, unknown>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue
    p.set(k, String(v))
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

// ── Hooks ──

export function useAdminAgentMetrics(period: '7d' | '30d' | 'all' = '7d') {
  return useQuery<AdminAgentMetrics>({
    queryKey: adminAgentKeys.metrics(period),
    queryFn: () => fetchJson<AdminAgentMetrics>(`/api/admin/agent/metrics?period=${period}`),
    staleTime: 30_000,
  })
}

export function useAdminAgentSessions(filters: SessionsFilters = {}) {
  return useQuery<Paginated<AdminAgentSession>>({
    queryKey: adminAgentKeys.sessions(filters),
    queryFn: () =>
      fetchJson<Paginated<AdminAgentSession>>(
        `/api/admin/agent/sessions${buildParams(filters as Record<string, unknown>)}`
      ),
    staleTime: 15_000,
  })
}

export function useAdminAgentSession(id: string | undefined) {
  return useQuery<SessionDetail>({
    queryKey: adminAgentKeys.session(id ?? ''),
    queryFn: () => fetchJson<SessionDetail>(`/api/admin/agent/sessions/${id}`),
    enabled: !!id,
    staleTime: 15_000,
  })
}

export function useAdminAgentToolLogs(filters: ToolLogsFilters = {}) {
  return useQuery<Paginated<AdminAgentToolLog>>({
    queryKey: adminAgentKeys.toolLogs(filters),
    queryFn: () =>
      fetchJson<Paginated<AdminAgentToolLog>>(
        `/api/admin/agent/tool-logs${buildParams(filters as Record<string, unknown>)}`
      ),
    staleTime: 15_000,
  })
}

export function useAdminAgentPendingActions(filters: PendingActionsFilters = {}) {
  return useQuery<Paginated<AdminAgentPendingAction>>({
    queryKey: adminAgentKeys.pending(filters),
    queryFn: () =>
      fetchJson<Paginated<AdminAgentPendingAction>>(
        `/api/admin/agent/pending-actions${buildParams(filters as Record<string, unknown>)}`
      ),
    staleTime: 15_000,
  })
}

export function useAdminAgentDegradations(filters: DegradationsFilters = {}) {
  return useQuery<Paginated<AdminAgentDegradation>>({
    queryKey: adminAgentKeys.degradations(filters),
    queryFn: () =>
      fetchJson<Paginated<AdminAgentDegradation>>(
        `/api/admin/agent/degradations${buildParams(filters as Record<string, unknown>)}`
      ),
    staleTime: 15_000,
  })
}
