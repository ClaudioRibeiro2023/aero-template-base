/**
 * GET  /api/admin/roles — lista role_definitions do tenant
 * POST /api/admin/roles — cria role custom (ADMIN only)
 */
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/app/lib/supabase-server'
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
import { getAuthUser } from '@/lib/auth-guard'
import { auditLog } from '@/lib/audit-log'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('admin-roles', async function GET(request: NextRequest) {
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
    .from('role_definitions')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('hierarchy_level', { ascending: false })

  if (dbError) {
    console.error('[admin/roles/GET]', dbError)
    return serverError()
  }

  return ok({ items: data ?? [], total: data?.length ?? 0 })
})

export const POST = withApiLog('admin-roles', async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

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

  const { roleCreateSchema } = await import('@template/shared/schemas')
  const parsed = roleCreateSchema.safeParse(body)
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
    .from('role_definitions')
    .insert({
      tenant_id: tenantId,
      name: parsed.data.name,
      display_name: parsed.data.display_name,
      description: parsed.data.description ?? '',
      permissions: parsed.data.permissions,
      hierarchy_level: parsed.data.hierarchy_level,
      is_system: false,
    })
    .select()
    .single()

  if (dbError) {
    console.error('[admin/roles/POST]', dbError)
    return serverError()
  }

  await auditLog({
    userId: user.id,
    action: 'CREATE',
    resource: 'role_definitions',
    resourceId: data?.id,
    details: { name: parsed.data.name },
  })

  return created(data)
})
