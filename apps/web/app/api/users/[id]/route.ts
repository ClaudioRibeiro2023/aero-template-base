/**
 * GET    /api/users/[id]  — busca profile por ID
 * PUT    /api/users/[id]  — atualiza profile
 * DELETE /api/users/[id]  — desativa usuario (soft delete)
 *
 * Megaplan V4 Sprint A: Users CRUD real.
 */
import type { NextRequest } from 'next/server'
import { userUpdateSchema } from '@template/shared/schemas'
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  tooManyRequests,
  serverError,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getAuthUser } from '@/lib/auth-guard'
import { createServerSupabase } from '@/app/lib/supabase-server'

export const dynamic = 'force-dynamic'

// ── GET /api/users/[id] ──
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error: authError } = await getAuthUser()
  if (!user) return unauthorized(authError ?? undefined)

  const supabase = createServerSupabase()
  const { id } = await params
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, email, display_name, avatar_url, phone, department, role, is_active, tenant_id, metadata, created_at, updated_at'
    )
    .eq('id', id)
    .single()

  if (error?.code === 'PGRST116') return notFound('Usuario nao encontrado')
  if (error) {
    console.error('[users/GET:id]', error)
    return serverError()
  }
  return ok(data)
}

// ── PUT /api/users/[id] ──
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const { user, error: authError } = await getAuthUser()
  if (!user) return unauthorized(authError ?? undefined)

  const { id } = await params

  // Usuarios podem editar o proprio perfil; ADMIN pode editar qualquer um
  const isSelf = user.id === id
  if (!isSelf && user.role !== 'ADMIN') {
    return forbidden('Apenas administradores podem editar outros usuarios')
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parsed = userUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Dados invalidos', parsed.error.flatten().fieldErrors)
  }

  // Non-admin cannot change role or is_active
  const updateData = { ...parsed.data }
  if (!isSelf && user.role !== 'ADMIN') {
    delete updateData.role
    delete updateData.is_active
  }
  if (isSelf && user.role !== 'ADMIN') {
    delete updateData.role
    delete updateData.is_active
  }

  const supabase = createServerSupabase()

  // Update profile
  const { phone, department, ...rest } = updateData
  const profilePayload = {
    ...rest,
    ...(phone !== undefined ? { phone: phone || null } : {}),
    ...(department !== undefined ? { department: department || null } : {}),
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(profilePayload)
    .eq('id', id)
    .select()
    .single()

  if (error?.code === 'PGRST116') return notFound('Usuario nao encontrado')
  if (error) {
    console.error('[users/PUT:id]', error)
    return serverError()
  }

  // Sync role to app_metadata if changed by admin
  if (updateData.role) {
    await supabase.auth.admin.updateUserById(id, {
      app_metadata: { role: updateData.role },
    })
  }

  return ok(data)
}

// ── DELETE /api/users/[id] ── (soft delete: desativa)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 15 })
  if (!success) return tooManyRequests()

  const { user, error: authError } = await getAuthUser()
  if (!user) return unauthorized(authError ?? undefined)
  if (user.role !== 'ADMIN') return forbidden('Apenas administradores podem desativar usuarios')

  const { id } = await params

  // Impedir auto-desativacao
  if (user.id === id) return badRequest('Voce nao pode desativar a si mesmo')

  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', id)
    .select()
    .single()

  if (error?.code === 'PGRST116') return notFound('Usuario nao encontrado')
  if (error) {
    console.error('[users/DELETE:id]', error)
    return serverError()
  }
  return ok(data)
}
