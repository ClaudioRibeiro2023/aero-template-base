/**
 * POST /api/auth/switch-org — Troca organização ativa do usuário
 */
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/app/lib/supabase-server'
import { requireJson } from '@/lib/api-guard'
import { ok, badRequest, unauthorized, forbidden, serverError } from '@/lib/api-response'
import { getAuthUser } from '@/lib/auth-guard'
import { auditLog } from '@/lib/audit-log'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const { user, error } = await getAuthUser()
  if (error || !user) return unauthorized()

  const body = await request.json().catch(() => null)
  if (!body?.orgId || typeof body.orgId !== 'string') {
    return badRequest('orgId é obrigatório')
  }

  try {
    const supabase = await createServerSupabase()

    // Verificar se o usuário é membro da organização
    const { data: membership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('org_id', body.orgId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return forbidden('Você não é membro desta organização')
    }

    // Atualizar org_id no perfil
    const { error: updateError } = await supabase
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
}
