/**
 * GET /api/organizations — Lista organizações do usuário
 */
import type { NextRequest } from 'next/server'
import { createServerSupabase } from '@/app/lib/supabase-server'
import { ok, unauthorized, serverError } from '@/lib/api-response'
import { getAuthUser } from '@/lib/auth-guard'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (success === false) {
    return new Response('Too many requests', { status: 429 })
  }

  const { user, error } = await getAuthUser()
  if (error || !user) return unauthorized()

  try {
    const supabase = await createServerSupabase()

    const { data: memberships } = await supabase
      .from('organization_members')
      .select('org_id, role, organizations(id, name, slug, plan, settings, logo_url)')
      .eq('user_id', user.id)

    const orgs = (memberships ?? []).map(m => {
      const org = m.organizations as unknown as Record<string, unknown> | null
      return { ...org, memberRole: m.role }
    })

    return ok(orgs)
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao listar organizações')
  }
}
