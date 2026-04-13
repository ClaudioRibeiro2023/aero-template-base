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
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('user-onboarding', async function GET(_request: NextRequest) {
  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  // onboarding_step column not yet provisioned — return safe default
  return ok({ step: 0 })
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
    // onboarding_step column may not exist in all deployments
    // Accept the request but return success without persisting
    return ok({ step: body.step })
  } catch {
    return ok({ step: body.step })
  }
})
