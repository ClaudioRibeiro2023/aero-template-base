import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerSupabase, createAnonSupabase } from '@/app/lib/supabase-server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import {
  ok,
  badRequest,
  unauthorized,
  serverError,
  tooManyRequests,
  notFound,
} from '@/lib/api-response'

export const dynamic = 'force-dynamic'

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null

  const token = authHeader.replace('Bearer ', '')
  const supabase = createAnonSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser(token)
  return user
}

const AdminConfigSchema = z
  .object({
    branding: z
      .object({
        appName: z.string().max(100).optional(),
        logoUrl: z.string().url().optional(),
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
    navigation: z.record(z.unknown()).optional(),
  })
  .strict()

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const user = await authenticateRequest(request)
  if (!user) return unauthorized()

  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return badRequest('Missing x-tenant-id header')

  const { data, error } = await createServerSupabase()
    .from('admin_config')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (error) return notFound(error.message)

  return ok(data)
}

export async function PATCH(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const user = await authenticateRequest(request)
  if (!user) return unauthorized()

  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) return badRequest('Missing x-tenant-id header')

  let body
  try {
    body = AdminConfigSchema.parse(await request.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return badRequest('Invalid input', err.errors)
    }
    return badRequest('Invalid JSON')
  }

  const { data, error } = await createServerSupabase()
    .from('admin_config')
    .update(body)
    .eq('tenant_id', tenantId)
    .select()
    .single()

  if (error) return serverError(error.message)

  return ok(data)
}
