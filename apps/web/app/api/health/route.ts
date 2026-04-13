import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ok } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) {
    return new Response(JSON.stringify({ status: 'rate_limited' }), { status: 429 })
  }

  // Demo mode — return healthy status without Supabase check
  if (isDemoMode) {
    return ok({
      status: 'healthy',
      supabase: 'demo',
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? '2.1.0',
      environment: process.env.NODE_ENV,
      demo: true,
    })
  }

  // Check Supabase connectivity
  let supabaseStatus: 'connected' | 'error' = 'error'
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (c: { name: string; value: string; options?: Record<string, unknown> }[]) =>
            c.forEach(({ name, value, options }) => cookieStore.set(name, value, options as never)),
        },
      }
    )
    // Connectivity check with fallback
    const { error } = await supabase.from('tenants').select('id').limit(1)
    if (error) {
      const { error: fallback } = await supabase.from('profiles').select('id').limit(1)
      supabaseStatus = fallback ? 'error' : 'connected'
    } else {
      supabaseStatus = 'connected'
    }
  } catch {
    supabaseStatus = 'error'
  }

  return ok({
    status: 'healthy',
    supabase: supabaseStatus,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? '2.1.0',
    environment: process.env.NODE_ENV,
  })
}
