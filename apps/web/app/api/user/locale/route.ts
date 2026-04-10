/**
 * PATCH /api/user/locale — Atualiza locale do usuário no perfil
 * GET   /api/user/locale — Retorna locale atual
 */
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/app/lib/supabase-server'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized, serverError } from '@/lib/api-response'
import { getAuthUser } from '@/lib/auth-guard'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es']

export const GET = withApiLog('user-locale', async function GET(_request: NextRequest) {
  const { user, error } = await getAuthUser()
  if (error || !user) return unauthorized()

  try {
    const supabase = await createServerSupabase()
    const { data } = await supabase.from('profiles').select('locale').eq('id', user.id).single()

    return ok({ locale: data?.locale || 'pt-BR' })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao buscar locale')
  }
})

export const PATCH = withApiLog('user-locale', async function PATCH(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const { user, error } = await getAuthUser()
  if (error || !user) return unauthorized()

  const body = await request.json().catch(() => null)
  if (!body?.locale || !SUPPORTED_LOCALES.includes(body.locale)) {
    return badRequest(`Locale inválido. Suportados: ${SUPPORTED_LOCALES.join(', ')}`)
  }

  try {
    const supabase = await createServerSupabase()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ locale: body.locale })
      .eq('id', user.id)

    if (updateError) throw updateError

    return ok({ locale: body.locale })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao atualizar locale')
  }
})
