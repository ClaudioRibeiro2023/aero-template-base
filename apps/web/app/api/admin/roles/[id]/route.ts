/**
 * GET    /api/admin/roles/[id] — detalhes + contagem de users
 * PUT    /api/admin/roles/[id] — atualizar (system: apenas display_name/description)
 * DELETE /api/admin/roles/[id] — remover (bloqueado se is_system ou tem users)
 */
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/app/lib/supabase-server'
import { requireJson } from '@/lib/api-guard'
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getAuthUser } from '@/lib/auth-guard'
import { auditLog } from '@/lib/audit-log'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export const GET = withApiLog(
  'admin-roles-detail',
  async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 120 })
    if (!success) return tooManyRequests()

    const { user, error } = await getAuthUser()
    if (error || !user) return unauthorized()
    if (!['ADMIN', 'GESTOR'].includes(user.role)) return forbidden()

    const supabase = createServerSupabase()

    const { data: role, error: dbError } = await supabase
      .from('role_definitions')
      .select('*')
      .eq('id', id)
      .single()

    if (dbError || !role) return notFound()

    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', role.tenant_id)
      .eq('role_name', role.name)

    return ok({ ...role, user_count: count ?? 0 })
  }
)

export const PUT = withApiLog(
  'admin-roles-detail',
  async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const jsonError = requireJson(request)
    if (jsonError) return jsonError

    const { id } = await params
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

    const { roleUpdateSchema } = await import('@template/shared/schemas')
    const parsed = roleUpdateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Dados invalidos')

    const supabase = createServerSupabase()

    const { data: existing } = await supabase
      .from('role_definitions')
      .select('id, is_system')
      .eq('id', id)
      .single()

    if (!existing) return notFound()

    const update: Record<string, unknown> = {}
    if (parsed.data.display_name) update.display_name = parsed.data.display_name
    if (parsed.data.description !== undefined) update.description = parsed.data.description
    if (!existing.is_system) {
      if (parsed.data.permissions !== undefined) update.permissions = parsed.data.permissions
      if (parsed.data.hierarchy_level !== undefined)
        update.hierarchy_level = parsed.data.hierarchy_level
    }

    const { data, error: dbError } = await supabase
      .from('role_definitions')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (dbError) return badRequest(dbError.message)

    await auditLog({
      userId: user.id,
      action: 'UPDATE',
      resource: 'role_definitions',
      resourceId: id,
      details: update,
    })

    return ok(data)
  }
)

export const DELETE = withApiLog(
  'admin-roles-detail',
  async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
    if (!success) return tooManyRequests()

    const { user, error } = await getAuthUser()
    if (error || !user) return unauthorized()
    if (user.role !== 'ADMIN') return forbidden()

    const supabase = createServerSupabase()

    const { data: role } = await supabase
      .from('role_definitions')
      .select('id, name, is_system, tenant_id')
      .eq('id', id)
      .single()

    if (!role) return notFound()
    if (role.is_system) return badRequest('Roles do sistema nao podem ser removidas')

    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', role.tenant_id)
      .eq('role_name', role.name)

    if (count && count > 0) {
      return badRequest(`Nao e possivel remover: ${count} usuario(s) com esta role`)
    }

    const { error: dbError } = await supabase.from('role_definitions').delete().eq('id', id)

    if (dbError) return badRequest(dbError.message)

    await auditLog({
      userId: user.id,
      action: 'DELETE',
      resource: 'role_definitions',
      resourceId: id,
      details: { name: role.name },
    })

    return ok({ deleted: true })
  }
)
