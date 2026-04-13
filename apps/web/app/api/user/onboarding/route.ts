/**
 * GET  /api/user/onboarding — Retorna progresso atual do onboarding
 * PATCH /api/user/onboarding — Atualiza progresso do onboarding
 *
 * v3.0: Migrado para @template/data auth gateway + SupabaseDbClient.
 */
import type { NextRequest } from 'next/server'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { SupabaseDbClient } from '@template/data/supabase'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('user-onboarding', async function GET(_request: NextRequest) {
  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  try {
    const db = new SupabaseDbClient()
    const client = await db.asUser()
    const { data } = await client
      .from('profiles')
      .select('onboarding_step, onboarding_completed_at')
      .eq('id', user.id)
      .single()

    return ok({ step: data?.onboarding_step ?? 0, completedAt: data?.onboarding_completed_at })
  } catch {
    return ok({ step: 0 })
  }
})

export const PATCH = withApiLog('user-onboarding', async function PATCH(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const body = await request.json().catch(() => null)
  if (typeof body?.step !== 'number' || body.step < 0 || body.step > 5) {
    return badRequest('step deve ser um número entre 0 e 5')
  }

  try {
    const db = new SupabaseDbClient()
    const client = await db.asUser()
    const updateData: Record<string, unknown> = { onboarding_step: body.step }
    if (body.step >= 5) {
      updateData.onboarding_completed_at = new Date().toISOString()
    }

    await client.from('profiles').update(updateData).eq('id', user.id)
    return ok({ step: body.step })
  } catch {
    return ok({ step: body.step })
  }
})
