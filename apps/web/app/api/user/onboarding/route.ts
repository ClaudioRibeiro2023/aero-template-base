/**
 * PATCH /api/user/onboarding — Atualiza progresso do onboarding
 */
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/app/lib/supabase-server'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized, serverError } from '@/lib/api-response'
import { getAuthUser } from '@/lib/auth-guard'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const { user, error } = await getAuthUser()
  if (error || !user) return unauthorized()

  const body = await request.json().catch(() => null)
  if (typeof body?.step !== 'number' || body.step < 0 || body.step > 5) {
    return badRequest('step deve ser um número entre 0 e 5')
  }

  try {
    const supabase = await createServerSupabase()
    const updateData: Record<string, unknown> = { onboarding_step: body.step }

    if (body.step >= 5) {
      updateData.onboarding_completed_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) throw updateError

    return ok({ step: body.step })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao atualizar onboarding')
  }
}
