/**
 * GET   /api/admin/config  — busca config do tenant do usuario
 * PATCH /api/admin/config  — atualiza config (ADMIN/GESTOR)
 *
 * v3.0: Migrado para @template/data auth gateway + SupabaseDbClient.
 */
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { SupabaseDbClient } from '@template/data/supabase'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  serverError,
  tooManyRequests,
  notFound,
} from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const AdminConfigSchema = z.object({
  branding: z
    .object({
      appName: z.string().max(100).optional(),
      logoUrl: z.string().url().or(z.literal('')).optional(),
      faviconUrl: z.string().url().or(z.literal('')).optional(),
      primaryColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
      secondaryColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
    })
    .optional(),
  theme: z.record(z.unknown()).optional(),
  navigation: z.array(z.unknown()).or(z.record(z.unknown())).optional(),
  notifications: z
    .object({
      emailEnabled: z.boolean().optional(),
      pushEnabled: z.boolean().optional(),
      systemAlertsEnabled: z.boolean().optional(),
      weeklyReportsEnabled: z.boolean().optional(),
    })
    .optional(),
  webhooks: z
    .array(
      z.object({
        id: z.string(),
        url: z.string(),
        events: z.string(),
      })
    )
    .optional(),
  maintenance_mode: z.boolean().optional(),
  default_language: z.string().max(10).optional(),
  default_timezone: z.string().max(50).optional(),
})

export const GET = withApiLog('admin-config', async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const { user } = await getAuthGateway().getUser()
  if (!user) return unauthorized()
  if (user.role !== 'ADMIN' && user.role !== 'GESTOR') return forbidden('Acesso restrito')

  const db = new SupabaseDbClient()
  const client = db.asAdmin()

  // Buscar tenant_id do profile do usuario
  const { data: profile } = await client
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const tenantId = profile?.tenant_id
  if (!tenantId) {
    // Fallback: buscar config do primeiro tenant
    const { data, error } = await client.from('admin_config').select('*').limit(1).single()
    if (error) return notFound('Nenhuma configuracao encontrada')
    return ok(data)
  }

  const { data, error } = await client
    .from('admin_config')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    console.error('[admin/config/GET]', error)
    return notFound('Nenhuma configuracao encontrada')
  }
  return ok(data)
})

export const PATCH = withApiLog('admin-config', async function PATCH(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const { user } = await getAuthGateway().getUser()
  if (!user) return unauthorized()
  if (user.role !== 'ADMIN' && user.role !== 'GESTOR') return forbidden('Acesso restrito')

  let body
  try {
    body = AdminConfigSchema.parse(await request.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return badRequest('Dados invalidos', err.errors)
    }
    return badRequest('JSON invalido')
  }

  const db = new SupabaseDbClient()
  const client = db.asAdmin()

  // Buscar tenant_id do profile
  const { data: profile } = await client
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  const tenantId = profile?.tenant_id

  // Construir payload de update — campos JSONB precisam ser atualizados individualmente
  const updatePayload: Record<string, unknown> = {}
  if (body.branding !== undefined) updatePayload.branding = body.branding
  if (body.theme !== undefined) updatePayload.theme = body.theme
  if (body.navigation !== undefined) updatePayload.navigation = body.navigation
  if (body.notifications !== undefined) updatePayload.notifications = body.notifications
  if (body.webhooks !== undefined) updatePayload.webhooks = body.webhooks
  if (body.maintenance_mode !== undefined) updatePayload.maintenance_mode = body.maintenance_mode
  if (body.default_language !== undefined) updatePayload.default_language = body.default_language
  if (body.default_timezone !== undefined) updatePayload.default_timezone = body.default_timezone

  let query = client.from('admin_config').update(updatePayload)

  if (tenantId) {
    query = query.eq('tenant_id', tenantId)
  }

  const { data, error } = await query.select().single()

  if (error) {
    console.error('[admin/config/PATCH]', error)
    return serverError()
  }
  return ok(data)
})
