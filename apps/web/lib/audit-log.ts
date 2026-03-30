/**
 * Audit logging for admin operations.
 * Records who did what and when for compliance and debugging.
 */
export interface AuditEntry {
  userId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'LOGIN' | 'LOGOUT'
  resource: string
  resourceId?: string
  details?: Record<string, unknown>
  ip?: string
}

/**
 * Log an admin action. In production, writes to Supabase audit_logs table.
 * Falls back to console in development.
 */
export async function auditLog(entry: AuditEntry): Promise<void> {
  const timestamp = new Date().toISOString()
  const logEntry = { ...entry, timestamp }

  if (process.env.NODE_ENV === 'development') {
    console.info('[AUDIT]', JSON.stringify(logEntry))
    return
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      console.warn('[AUDIT] Missing Supabase credentials, logging to console')
      console.info('[AUDIT]', JSON.stringify(logEntry))
      return
    }
    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    await supabase.from('audit_logs').insert({
      user_id: entry.userId,
      action: entry.action,
      resource: entry.resource,
      resource_id: entry.resourceId,
      details: entry.details,
      ip_address: entry.ip,
      created_at: timestamp,
    })
  } catch (err) {
    console.error('[AUDIT] Failed to write audit log:', err)
  }
}
