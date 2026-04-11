/**
 * GET    /api/users/[id]  — busca profile por ID
 * PUT    /api/users/[id]  — atualiza profile
 * DELETE /api/users/[id]  — desativa usuario (soft delete)
 *
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
import { userUpdateSchema } from '@template/shared/schemas'
import { requireJson } from '@/lib/api-guard'
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
import { getRepository, getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// ── GET /api/users/[id] ──
export const GET = withApiLog(
  'users-detail',
  async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
    if (!success) return tooManyRequests()

    const { user, error: authError } = await getAuthGateway().getUser()
    if (!user) return unauthorized(authError ?? undefined)

    try {
      const { id } = await params
      const users = getRepository('users')
      const data = await users.findById(id)
      if (!data) return notFound('Usuario nao encontrado')
      return ok(data)
    } catch (err) {
      console.error('[users/GET:id]', err)
      return serverError()
    }
  }
)

// ── PUT /api/users/[id] ──
export const PUT = withApiLog(
  'users-detail',
  async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const jsonError = requireJson(request)
    if (jsonError) return jsonError

    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
    if (!success) return tooManyRequests()

    const { user, error: authError } = await getAuthGateway().getUser()
    if (!user) return unauthorized(authError ?? undefined)

    const { id } = await params
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

    const updateData = { ...parsed.data }
    if (!isSelf && user.role !== 'ADMIN') {
      delete updateData.role
      delete updateData.is_active
    }
    if (isSelf && user.role !== 'ADMIN') {
      delete updateData.role
      delete updateData.is_active
    }

    try {
      const { phone, department, ...rest } = updateData
      const profilePayload = {
        ...rest,
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(department !== undefined ? { department: department || null } : {}),
      }

      const users = getRepository('users')
      const data = await users.update(id, profilePayload)
      if (!data) return notFound('Usuario nao encontrado')

      // Sync role to app_metadata if changed by admin
      if (updateData.role) {
        const { SupabaseDbClient } = await import('@template/data/supabase')
        const db = new SupabaseDbClient()
        const admin = db.asAdmin()
        await admin.auth.admin.updateUserById(id, {
          app_metadata: { role: updateData.role },
        })
      }

      return ok(data)
    } catch (err) {
      console.error('[users/PUT:id]', err)
      return serverError()
    }
  }
)

// ── DELETE /api/users/[id] ── (soft delete: desativa)
export const DELETE = withApiLog(
  'users-detail',
  async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const ip = getClientIp(request.headers)
    const { success } = rateLimit(ip, { windowMs: 60_000, max: 15 })
    if (!success) return tooManyRequests()

    const { user, error: authError } = await getAuthGateway().getUser()
    if (!user) return unauthorized(authError ?? undefined)
    if (user.role !== 'ADMIN') return forbidden('Apenas administradores podem desativar usuarios')

    const { id } = await params
    if (user.id === id) return badRequest('Voce nao pode desativar a si mesmo')

    try {
      const users = getRepository('users')
      const data = await users.update(id, { is_active: false })
      if (!data) return notFound('Usuario nao encontrado')
      return ok(data)
    } catch (err) {
      console.error('[users/DELETE:id]', err)
      return serverError()
    }
  }
)
