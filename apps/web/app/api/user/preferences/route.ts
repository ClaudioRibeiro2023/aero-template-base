/**
 * GET   /api/user/preferences — Retorna preferencias do usuario
 * PATCH /api/user/preferences — Atualiza preferencias (merge parcial no JSONB)
 */
import type { NextRequest } from 'next/server'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { SupabaseDbClient } from '@template/data/supabase'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const VALID_KEYS = [
  'email_notifications',
  'push_notifications',
  'profile_visible',
  'activity_visible',
] as const

export const GET = withApiLog('user-preferences', async function GET(_request: NextRequest) {
  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  try {
    const db = new SupabaseDbClient()
    const client = await db.asUser()
    const { data } = await client.from('profiles').select('preferences').eq('id', user.id).single()

    const defaults = {
      email_notifications: true,
      push_notifications: false,
      profile_visible: true,
      activity_visible: false,
    }

    return ok({ ...defaults, ...(data?.preferences || {}) })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao buscar preferencias')
  }
})

export const PATCH = withApiLog('user-preferences', async function PATCH(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return badRequest('Body deve ser um objeto JSON')
  }

  // Validar que só chaves permitidas estão presentes
  const keys = Object.keys(body)
  const invalid = keys.filter(k => !VALID_KEYS.includes(k as (typeof VALID_KEYS)[number]))
  if (invalid.length > 0) {
    return badRequest(`Chaves invalidas: ${invalid.join(', ')}`)
  }

  // Validar que todos os valores são booleanos
  for (const k of keys) {
    if (typeof body[k] !== 'boolean') {
      return badRequest(`Valor de '${k}' deve ser booleano`)
    }
  }

  try {
    const db = new SupabaseDbClient()
    const client = await db.asUser()

    // Ler preferencias atuais e fazer merge
    const { data: current } = await client
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .single()

    const merged = { ...(current?.preferences || {}), ...body }

    const { error: updateError } = await client
      .from('profiles')
      .update({ preferences: merged })
      .eq('id', user.id)

    if (updateError) {
      console.error('[user-preferences/PATCH]', updateError)
      return serverError('Erro ao atualizar preferencias')
    }

    return ok(merged)
  } catch (err) {
    console.error('[user-preferences/PATCH]', err)
    return serverError(err instanceof Error ? err.message : 'Erro ao atualizar preferencias')
  }
})
