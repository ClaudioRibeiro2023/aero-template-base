// ============================================================================
// Audit Log Domain Types
// ============================================================================

/**
 * Audit log action types
 */
export type AuditLogAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'READ'
  | 'LOGIN'
  | 'LOGOUT'
  | 'BULK_CLOSE'
  | 'BULK_REASSIGN'
  | 'BULK_DEACTIVATE'
  | 'BULK_ROLE_CHANGE'

/**
 * Audit log entity
 */
export interface AuditLog {
  id: string
  user_id: string
  action: AuditLogAction
  resource: string
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

/**
 * Paginated audit logs response
 */
export interface AuditLogsResponse {
  items: AuditLog[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

/**
 * Filters for audit log listing
 */
export interface AuditLogFilters {
  action?: string
  resource?: string
  user_id?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
}
