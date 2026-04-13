/**
 * GET /api/platform/metrics — Retorna métricas semanais da plataforma
 * Acessível apenas para ADMIN e GESTOR.
 *
 * v3.0: Migrado para @template/data auth gateway + SupabaseDbClient.
 */
import type { NextRequest } from 'next/server'
import { SupabaseDbClient } from '@template/data/supabase'
import { ok, unauthorized, forbidden, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('platform-metrics', async function GET(_request: NextRequest) {
  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  try {
    const db = new SupabaseDbClient()
    const client = db.asAdmin()

    // Verificar role — já disponível via auth gateway, mas confirma via profile
    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const normalizedRole = (profile?.role || '').toLowerCase()
    if (!profile || !['admin', 'member', 'owner'].includes(normalizedRole)) {
      return forbidden('Acesso restrito a administradores')
    }

    // Buscar últimas 4 semanas de métricas
    const { data: metrics, error: metricsError } = await client
      .from('platform_metrics')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(4)

    if (metricsError) throw metricsError

    return ok({ metrics: metrics ?? [] })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao buscar métricas')
  }
})
