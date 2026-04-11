/**
 * POST /api/auth/switch-org — Troca organização ativa do usuário
 *
 * v3.0: Migrado para @template/data auth gateway + SupabaseDbClient.
 */
import type { NextRequest } from 'next/server'
import { SupabaseDbClient } from '@template/data/supabase'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized, forbidden, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { auditLog } from '@/lib/audit-log'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export const POST = withApiLog('auth-switch-org', async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const body = await request.json().catch(() => null)
  if (!body?.orgId || typeof body.orgId !== 'string') {
    return badRequest('orgId é obrigatório')
  }

  try {
    const db = new SupabaseDbClient()
    const client = db.asAdmin()

    // Verificar se o usuário é membro da organização
    const { data: membership } = await client
      .from('organization_members')
      .select('id')
      .eq('org_id', body.orgId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return forbidden('Você não é membro desta organização')
    }

    // Atualizar org_id no perfil
    const { error: updateError } = await client
      .from('profiles')
      .update({ org_id: body.orgId })
      .eq('id', user.id)

    if (updateError) throw updateError

    await auditLog({
      action: 'UPDATE',
      resource: 'organizations',
      resourceId: body.orgId,
      userId: user.id,
      details: { operation: 'switch_org', to: body.orgId },
    })

    return ok({ orgId: body.orgId })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao trocar organização')
  }
})
