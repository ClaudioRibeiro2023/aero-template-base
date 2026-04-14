/**
 * PATCH  /api/feature-flags/[id] — atualiza flag (toggle enabled, description)
 * DELETE /api/feature-flags/[id] — remove flag
 *
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
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
import { auditLog } from '@/lib/audit-log'
import { withApiLog } from '@/lib/logger'
import { isDemoMode, DEMO_FEATURE_FLAGS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

export const PATCH = withApiLog(
  'feature-flags-detail',
  async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (isDemoMode) {
      const { id } = await params
      const body = await request.json().catch(() => ({}))
      const flag = DEMO_FEATURE_FLAGS.find(f => f.id === id) ?? DEMO_FEATURE_FLAGS[0]
      return ok({ ...flag, ...body, id })
    }

    const { id } = await params
    const ip = getClientIp(request.headers)
    const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
    if (!success) return tooManyRequests()

    const { user, error } = await getAuthGateway().getUser()
    if (error || !user) return unauthorized()
    if (!['ADMIN', 'GESTOR'].includes(user.role)) return forbidden()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return badRequest('JSON invalido')
    }

    const { featureFlagUpdateSchema } = await import('@template/shared/schemas')
    const parsed = featureFlagUpdateSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Dados invalidos')

    const update: Record<string, unknown> = {}
    if (typeof parsed.data.enabled === 'boolean') update.enabled = parsed.data.enabled
    if (typeof parsed.data.description === 'string') update.description = parsed.data.description
    if (typeof parsed.data.flag_name === 'string') update.flag_name = parsed.data.flag_name
    if (Object.keys(update).length === 0) return badRequest('Nenhum campo para atualizar')

    try {
      const flags = getRepository('featureFlags')
      const data = await flags.update(id, update)
      if (!data) return notFound()

      await auditLog({
        userId: user.id,
        action: 'UPDATE',
        resource: 'feature_flags',
        resourceId: id,
        details: update,
      })

      return ok(data)
    } catch (err) {
      console.error('[feature-flags/PATCH:id]', err)
      return serverError()
    }
  }
)

export const DELETE = withApiLog(
  'feature-flags-detail',
  async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (isDemoMode) return ok({ deleted: true })

    const { id } = await params
    const ip = getClientIp(request.headers)
    const { success } = await rateLimit(ip, { windowMs: 60_000, max: 30 })
    if (!success) return tooManyRequests()

    const { user, error } = await getAuthGateway().getUser()
    if (error || !user) return unauthorized()
    if (user.role !== 'ADMIN') return forbidden()

    try {
      const flags = getRepository('featureFlags')
      await flags.delete(id)

      await auditLog({
        userId: user.id,
        action: 'DELETE',
        resource: 'feature_flags',
        resourceId: id,
      })

      return ok({ deleted: true })
    } catch (err) {
      console.error('[feature-flags/DELETE:id]', err)
      return serverError()
    }
  }
)
