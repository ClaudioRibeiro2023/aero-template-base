/**
 * PATCH  /api/feature-flags/[id] — atualiza flag (toggle enabled, description)
 * DELETE /api/feature-flags/[id] — remove flag
 */
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/app/lib/supabase-server'
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
import { auditLog } from '@/lib/audit-log'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthUser()
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

  const supabase = createServerSupabase()

  const { data, error: dbError } = await supabase
    .from('feature_flags')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (dbError || !data) return notFound()

  await auditLog({
    userId: user.id,
    action: 'UPDATE',
    resource: 'feature_flags',
    resourceId: id,
    details: update,
  })

  return ok(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthUser()
  if (error || !user) return unauthorized()
  if (user.role !== 'ADMIN') return forbidden()

  const supabase = createServerSupabase()

  const { error: dbError } = await supabase.from('feature_flags').delete().eq('id', id)

  if (dbError) {
    console.error('[feature-flags/DELETE:id]', dbError)
    return serverError()
  }

  await auditLog({
    userId: user.id,
    action: 'DELETE',
    resource: 'feature_flags',
    resourceId: id,
  })

  return ok({ deleted: true })
}
