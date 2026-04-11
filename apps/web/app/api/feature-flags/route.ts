/**
 * GET  /api/feature-flags — lista feature flags do tenant
 * POST /api/feature-flags — cria nova flag
 *
 * v3.0: Migrado para @template/data repository pattern.
 * Nota: tenant lookup ainda usa Supabase direto (será abstraído em Sprint 4).
 */
import type { NextRequest } from 'next/server'
import { requireJson } from '@/lib/api-guard'
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  tooManyRequests,
  serverError,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getRepository, getAuthGateway } from '@/lib/data'
import { auditLog } from '@/lib/audit-log'
import { withApiLog } from '@/lib/logger'
import { SupabaseDbClient } from '@template/data/supabase'

export const dynamic = 'force-dynamic'

/** Helper: busca tenant_id do perfil do usuário */
async function getTenantId(userId: string): Promise<string | null> {
  const db = new SupabaseDbClient()
  const client = db.asAdmin()
  const { data } = await client.from('profiles').select('tenant_id').eq('id', userId).single()
  return data?.tenant_id ?? null
}

export const GET = withApiLog('feature-flags', async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 120 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()
  if (!['ADMIN', 'GESTOR'].includes(user.role)) return forbidden()

  const tenantId = await getTenantId(user.id)
  if (!tenantId) return badRequest('Nenhum tenant associado ao usuario')

  // ADMIN pode filtrar por org_id; demais veem apenas o próprio tenant
  const orgIdParam = request.nextUrl.searchParams.get('org_id')
  const effectiveTenantId = user.role === 'ADMIN' && orgIdParam ? orgIdParam : tenantId

  try {
    const flags = getRepository('featureFlags')
    const result = await flags.findMany({
      filters: [{ field: 'tenant_id', operator: 'eq', value: effectiveTenantId }],
      sort: [{ field: 'flag_name', ascending: true }],
      pagination: { page: 1, pageSize: 200 },
    })

    return ok({ items: result.data, total: result.total })
  } catch (err) {
    console.error('[feature-flags/GET]', err)
    return serverError()
  }
})

export const POST = withApiLog('feature-flags', async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()
  if (user.role !== 'ADMIN') return forbidden()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('JSON invalido')
  }

  const { featureFlagCreateSchema } = await import('@template/shared/schemas')
  const parsed = featureFlagCreateSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Dados invalidos')

  const tenantId = await getTenantId(user.id)
  if (!tenantId) return badRequest('Nenhum tenant associado ao usuario')

  try {
    const flags = getRepository('featureFlags')
    const data = await flags.create({
      flag_name: parsed.data.flag_name,
      description: parsed.data.description ?? '',
      enabled: parsed.data.enabled ?? false,
    })

    await auditLog({
      userId: user.id,
      action: 'CREATE',
      resource: 'feature_flags',
      resourceId: data?.id,
      details: { flag_name: parsed.data.flag_name },
    })

    return created(data)
  } catch (err) {
    console.error('[feature-flags/POST]', err)
    return serverError()
  }
})
