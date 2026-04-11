/**
 * GET  /api/config/navigation — retorna configuracao de navegacao do tenant
 * PUT  /api/config/navigation — substitui configuracao completa
 *
 * v3.0: Migrado para @template/data auth gateway + SupabaseDbClient.
 * v3.0 Sprint 5: fallback usa moduleRegistry em vez de { navigation: null }.
 */
import type { NextRequest } from 'next/server'
import { SupabaseDbClient } from '@template/data/supabase'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized, forbidden, tooManyRequests } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getAuthGateway } from '@/lib/data'
import { auditLog } from '@/lib/audit-log'
// Side-effect: popula o moduleRegistry com DEFAULT_MODULES + módulos isolados
import '@/config/modules'
import { moduleRegistry } from '@/lib/module-registry'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()
  if (!['ADMIN', 'GESTOR'].includes(user.role)) return forbidden()

  const db = new SupabaseDbClient()
  const client = db.asAdmin()

  const { data: profile } = await client
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    return badRequest('Nenhum tenant associado ao usuario')
  }
  const tenantId = profile.tenant_id

  const { data, error: dbError } = await client
    .from('admin_config')
    .select('navigation')
    .eq('tenant_id', tenantId)
    .single()

  if (dbError || !data) {
    // Sem config no DB: retorna config do Module Registry como fallback
    return ok({ navigation: moduleRegistry.toNavigationConfig() })
  }

  return ok({ navigation: data.navigation })
}

export async function PUT(request: NextRequest) {
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

  if (!body || typeof body !== 'object') return badRequest('Corpo invalido')
  const { navigation } = body as { navigation: unknown }
  if (!Array.isArray(navigation)) return badRequest('navigation deve ser um array')

  const db = new SupabaseDbClient()
  const client = db.asAdmin()

  const { data: profile } = await client
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    return badRequest('Nenhum tenant associado ao usuario')
  }
  const tenantId = profile.tenant_id

  const { error: dbError } = await client
    .from('admin_config')
    .update({ navigation, updated_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)

  if (dbError) return badRequest(dbError.message)

  await auditLog({
    userId: user.id,
    action: 'UPDATE',
    resource: 'admin_config.navigation',
    details: { items_count: (navigation as unknown[]).length },
  })

  return ok({ navigation })
}
