/**
 * GET /api/audit-logs — lista audit logs paginado com filtros
 * ADMIN only.
 *
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
import { ok, unauthorized, forbidden, tooManyRequests } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getRepository, getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode, DEMO_AUDIT_LOGS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('audit-logs', async function GET(request: NextRequest) {
  if (isDemoMode) {
    return ok({
      items: DEMO_AUDIT_LOGS,
      total: DEMO_AUDIT_LOGS.length,
      page: 1,
      page_size: 50,
      total_pages: 1,
    })
  }

  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()
  if (user.role !== 'ADMIN') return forbidden()

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') ?? undefined
  const resource = searchParams.get('resource') ?? undefined
  const userId = searchParams.get('user_id') ?? undefined
  const dateFrom = searchParams.get('date_from') ?? undefined
  const dateTo = searchParams.get('date_to') ?? undefined
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('page_size') ?? '50', 10)))

  const filters = [
    ...(action ? [{ field: 'action', operator: 'eq' as const, value: action }] : []),
    ...(resource
      ? [
          {
            field: 'resource',
            operator: 'ilike' as const,
            value: `%${resource.replace(/[,.()"'\\%]/g, '')}%`,
          },
        ]
      : []),
    ...(userId ? [{ field: 'user_id', operator: 'eq' as const, value: userId }] : []),
    ...(dateFrom ? [{ field: 'created_at', operator: 'gte' as const, value: dateFrom }] : []),
    ...(dateTo ? [{ field: 'created_at', operator: 'lte' as const, value: dateTo }] : []),
  ]

  const auditLogs = getRepository('auditLogs')
  const result = await auditLogs.findManyGraceful({
    filters,
    sort: [{ field: 'created_at', ascending: false }],
    pagination: { page, pageSize },
  })

  return ok({
    items: result.data,
    total: result.total,
    page,
    page_size: pageSize,
    total_pages: result.pages,
  })
})
