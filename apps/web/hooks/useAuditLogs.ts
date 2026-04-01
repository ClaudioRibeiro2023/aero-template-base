/**
 * useAuditLogs — React Query read-only hook para audit logs.
 * ADMIN only.
 */
import { useQuery } from '@tanstack/react-query'

// ── Types ──

export interface AuditLog {
  id: string
  user_id: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'LOGIN' | 'LOGOUT'
  resource: string
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface AuditLogsResponse {
  items: AuditLog[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface AuditLogFilters {
  action?: string
  resource?: string
  user_id?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}

async function fetchAuditLogs(filters: AuditLogFilters): Promise<AuditLogsResponse> {
  const params = new URLSearchParams()
  if (filters.action) params.set('action', filters.action)
  if (filters.resource) params.set('resource', filters.resource)
  if (filters.user_id) params.set('user_id', filters.user_id)
  if (filters.date_from) params.set('date_from', filters.date_from)
  if (filters.date_to) params.set('date_to', filters.date_to)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.page_size) params.set('page_size', String(filters.page_size))

  const res = await fetch(`/api/audit-logs?${params.toString()}`)
  const json = (await res.json()) as { data?: AuditLogsResponse; error?: { message?: string } }
  if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`)
  return (json.data ?? json) as AuditLogsResponse
}

// ── Query keys ──

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  list: (filters: AuditLogFilters) => [...auditLogKeys.all, 'list', filters] as const,
}

// ── Hook ──

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery<AuditLogsResponse>({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 15_000,
  })
}
