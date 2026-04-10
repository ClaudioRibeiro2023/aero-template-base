/**
 * GET /api/platform/metrics — Retorna métricas semanais da plataforma
 * Acessível apenas para ADMIN e GESTOR.
 */
import { createServerSupabase } from '@/app/lib/supabase-server'
import { ok, unauthorized, forbidden, serverError } from '@/lib/api-response'
import { getAuthUser } from '@/lib/auth-guard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { user, error } = await getAuthUser()
  if (error || !user) return unauthorized()

  try {
    const supabase = await createServerSupabase()

    // Verificar role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['ADMIN', 'GESTOR'].includes(profile.role)) {
      return forbidden('Acesso restrito a administradores')
    }

    // Buscar últimas 4 semanas de métricas
    const { data: metrics, error: metricsError } = await supabase
      .from('platform_metrics')
      .select('*')
      .order('week_start', { ascending: false })
      .limit(4)

    if (metricsError) throw metricsError

    return ok({ metrics: metrics ?? [] })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao buscar métricas')
  }
}
