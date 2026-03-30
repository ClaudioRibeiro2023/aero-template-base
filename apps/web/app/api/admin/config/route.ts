import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabase, createAnonSupabase } from '@/app/lib/supabase-server'

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
  const user = await authenticateRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) {
    return NextResponse.json({ error: 'Missing x-tenant-id header' }, { status: 400 })
  }

  const { data, error } = await createServerSupabase()
    .from('admin_config')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tenantId = request.headers.get('x-tenant-id')
  if (!tenantId) {
    return NextResponse.json({ error: 'Missing x-tenant-id header' }, { status: 400 })
  }

  let body
  try {
    body = AdminConfigSchema.parse(await request.json())
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { data, error } = await createServerSupabase()
    .from('admin_config')
    .update(body)
    .eq('tenant_id', tenantId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
