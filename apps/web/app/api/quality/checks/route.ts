/**
 * GET /api/quality/checks — retorna dados server-side para diagnóstico
 *
 * Coleta informações que só estão disponíveis no servidor:
 * - Variáveis de ambiente configuradas
 * - Status de dependências
 * - Configuração de segurança (headers)
 *
 * v3.0: Migrado para @template/data auth gateway.
 */
import type { NextRequest } from 'next/server'
import { ok, unauthorized, tooManyRequests } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getAuthGateway } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 10 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const checks = {
    env: {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      app_url: !!process.env.NEXT_PUBLIC_APP_URL,
      app_name: !!process.env.NEXT_PUBLIC_APP_NAME,
      demo_mode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
    },
    runtime: {
      node_version: process.version,
      environment: process.env.NODE_ENV,
    },
  }

  return ok(checks)
}
