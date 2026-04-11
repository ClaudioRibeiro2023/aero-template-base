/**
 * GET /api/platform/public-config — branding publico (sem auth)
 *
 * Sem autenticacao — qualquer visitor pode ver cores/logo.
 * v3.0: Migrado para @template/data SupabaseDbClient.
 */
import type { NextRequest } from 'next/server'
import { SupabaseDbClient } from '@template/data/supabase'
import { ok, tooManyRequests } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

// Defaults inlined to avoid importing adminConfig.ts (which pulls client-only deps via apiClient)
const DEFAULT_PUBLIC_CONFIG = {
  branding: {
    appName: 'Template Platform',
    logoUrl: null,
    faviconUrl: null,
    primaryColor: '#0087A8',
    secondaryColor: '#6366f1',
  },
  theme: {
    mode: 'system',
    density: 'comfortable',
    borderRadius: 'md',
    fontFamily: 'Inter, sans-serif',
  },
  notifications: {
    emailEnabled: true,
    pushEnabled: true,
    systemAlertsEnabled: true,
    weeklyReportsEnabled: false,
  },
  defaultLanguage: 'pt-BR',
  defaultTimezone: 'America/Sao_Paulo',
  maintenanceMode: false,
  setupComplete: false,
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  try {
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant_id')

    // Without a tenant_id, return defaults — never query DB unfiltered
    if (!tenantId) {
      return ok(DEFAULT_PUBLIC_CONFIG)
    }

    const db = new SupabaseDbClient()
    const client = await db.asUser()

    const { data, error } = await client
      .from('admin_config')
      .select(
        'branding, theme, notifications, default_language, default_timezone, maintenance_mode'
      )
      .eq('tenant_id', tenantId)
      .limit(1)
      .single()

    if (error || !data) {
      // Retornar config padrao se nao encontrar
      return ok(DEFAULT_PUBLIC_CONFIG)
    }

    // Merge com defaults para campos faltantes
    const config = {
      branding: {
        ...DEFAULT_PUBLIC_CONFIG.branding,
        ...((data.branding as Record<string, unknown>) ?? {}),
      },
      theme: { ...DEFAULT_PUBLIC_CONFIG.theme, ...((data.theme as Record<string, unknown>) ?? {}) },
      notifications: {
        ...DEFAULT_PUBLIC_CONFIG.notifications,
        ...((data.notifications as Record<string, unknown>) ?? {}),
      },
      defaultLanguage: data.default_language ?? DEFAULT_PUBLIC_CONFIG.defaultLanguage,
      defaultTimezone: data.default_timezone ?? DEFAULT_PUBLIC_CONFIG.defaultTimezone,
      maintenanceMode: data.maintenance_mode ?? false,
      setupComplete: true,
    }

    return ok(config)
  } catch {
    // Em caso de erro (ex: Supabase nao configurado), retornar defaults
    return ok(DEFAULT_PUBLIC_CONFIG)
  }
}
