/**
 * GET /api/organizations — Lista organizações do usuário
 *
 * v3.0: Migrado para @template/data auth gateway + SupabaseDbClient.
 */
import type { NextRequest } from 'next/server'
import { SupabaseDbClient } from '@template/data/supabase'
import { ok, unauthorized, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { withApiLog } from '@/lib/logger'
import { isDemoMode, DEMO_ORGANIZATIONS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('organizations', async function GET(request: NextRequest) {
  if (isDemoMode) return ok(DEMO_ORGANIZATIONS)

  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (success === false) {
    return new Response('Too many requests', { status: 429 })
  }

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  try {
    const db = new SupabaseDbClient()
    const client = await db.asUser()

    const { data: memberships } = await client
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
})
