/**
 * PATCH /api/user/locale — Atualiza locale do usuário no perfil
 * GET   /api/user/locale — Retorna locale atual
 *
 * v3.0: Migrado para @template/data auth gateway + SupabaseDbClient.
 */
import type { NextRequest } from 'next/server'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { SupabaseDbClient } from '@template/data/supabase'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es']

export const GET = withApiLog('user-locale', async function GET(_request: NextRequest) {
  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  try {
    const db = new SupabaseDbClient()
    const client = db.asAdmin()
    const { data } = await client.from('profiles').select('locale').eq('id', user.id).single()

    return ok({ locale: data?.locale || 'pt-BR' })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao buscar locale')
  }
})

export const PATCH = withApiLog('user-locale', async function PATCH(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const body = await request.json().catch(() => null)
  if (!body?.locale || !SUPPORTED_LOCALES.includes(body.locale)) {
    return badRequest(`Locale inválido. Suportados: ${SUPPORTED_LOCALES.join(', ')}`)
  }

  try {
    const db = new SupabaseDbClient()
    const client = db.asAdmin()
    const { error: updateError } = await client
      .from('profiles')
      .update({ locale: body.locale })
      .eq('id', user.id)

    if (updateError) throw updateError

    return ok({ locale: body.locale })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao atualizar locale')
  }
})
