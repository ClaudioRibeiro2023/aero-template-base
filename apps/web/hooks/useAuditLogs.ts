/**
 * useAuditLogs — React Query read-only hook para audit logs.
 * ADMIN only.
 *
 * Sprint 5: Refactored to delegate to auditLogsService.
 */
import { useQuery } from '@tanstack/react-query'
import { auditLogsService } from '@/services/auditLogs'
import type { AuditLogFilters, AuditLogsResponse } from '@/services/auditLogs'

// Re-export types for backwards compatibility
export type {
  AuditLog,
  AuditLogAction,
  AuditLogFilters,
  AuditLogsResponse,
} from '@/services/auditLogs'

// ── Query keys ──

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  list: (filters: AuditLogFilters) => [...auditLogKeys.all, 'list', filters] as const,
}

// ── Hook ──

export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery<AuditLogsResponse>({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => auditLogsService.list(filters),
    staleTime: 15_000,
  })
}
