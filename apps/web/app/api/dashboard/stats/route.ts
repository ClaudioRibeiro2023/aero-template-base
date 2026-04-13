/**
 * GET /api/dashboard/stats — Aggregated dashboard KPIs
 * Returns real counts from profiles, tasks, audit_logs, admin_config.
 * Graceful fallback per table (missing table → 0).
 */
import type { NextRequest } from 'next/server'
import { ok, unauthorized } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { SupabaseDbClient } from '@template/data/supabase'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

async function safeCount(
  client: Awaited<ReturnType<SupabaseDbClient['asUser']>>,
  table: string
): Promise<number> {
  try {
    const { count } = await client.from(table).select('*', { count: 'exact', head: true })
    return count ?? 0
  } catch {
    return 0
  }
}

export const GET = withApiLog('dashboard-stats', async function GET(_request: NextRequest) {
  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const db = new SupabaseDbClient()
  const client = await db.asUser()

  const [users, tasks, tickets, configItems] = await Promise.all([
    safeCount(client, 'profiles'),
    safeCount(client, 'tasks'),
    safeCount(client, 'support_tickets'),
    safeCount(client, 'feature_flags'),
  ])

  return ok({
    users,
    tasks,
    tickets,
    configItems,
  })
})
