/**
 * Audit Logs API service.
 * Sprint 5: Architecture Consistency — service layer extraction.
 */
import type { AuditLogFilters, AuditLogsResponse } from '@template/types'

// Re-export types for convenience
export type { AuditLog, AuditLogAction, AuditLogFilters, AuditLogsResponse } from '@template/types'

// ============================================================================
// API Functions
// ============================================================================

export const auditLogsService = {
  list: async (filters: AuditLogFilters = {}): Promise<AuditLogsResponse> => {
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
  },
}
