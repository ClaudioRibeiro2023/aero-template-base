/**
 * GET  /api/feature-flags — lista feature flags do tenant
 * POST /api/feature-flags — cria nova flag
 */
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/app/lib/supabase-server'
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  tooManyRequests,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getAuthUser } from '@/lib/auth-guard'
import { auditLog } from '@/lib/audit-log'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 120 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthUser()
  if (error || !user) return unauthorized()
  if (!['ADMIN', 'GESTOR'].includes(user.role)) return forbidden()

  const supabase = createServerSupabase()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    return badRequest('Nenhum tenant associado ao usuario')
  }
  const tenantId = profile.tenant_id

  const { data, error: dbError } = await supabase
    .from('feature_flags')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('flag_name', { ascending: true })

  if (dbError) return badRequest(dbError.message)

  return ok({ items: data ?? [], total: data?.length ?? 0 })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthUser()
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

  const supabase = createServerSupabase()

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) {
    return badRequest('Nenhum tenant associado ao usuario')
  }
  const tenantId = profile.tenant_id

  const { data, error: dbError } = await supabase
    .from('feature_flags')
    .insert({
      tenant_id: tenantId,
      flag_name: parsed.data.flag_name,
      description: parsed.data.description ?? '',
      enabled: parsed.data.enabled ?? false,
    })
    .select()
    .single()

  if (dbError) return badRequest(dbError.message)

  await auditLog({
    userId: user.id,
    action: 'CREATE',
    resource: 'feature_flags',
    resourceId: data?.id,
    details: { flag_name: parsed.data.flag_name },
  })

  return created(data)
}
