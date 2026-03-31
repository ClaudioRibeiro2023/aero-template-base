/**
 * GET    /api/tasks/[id]  — busca task por ID
 * PUT    /api/tasks/[id]  — atualiza task
 * DELETE /api/tasks/[id]  — remove task
 *
 * Sprint 7 (P1-01): CRUD de referência.
 */
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { taskUpdateSchema } from '@template/shared/schemas'
import {
  ok,
  noContent,
  badRequest,
  unauthorized,
  notFound,
  tooManyRequests,
  serverError,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

function createSupabaseServer() {
  const cookieStore = cookies() as unknown as Awaited<ReturnType<typeof cookies>>
  return createServerClient(
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
}

// ── GET /api/tasks/[id] ──
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 120 })
  if (!success) return tooManyRequests()

  const supabase = createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { id } = await params
  const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()

  if (error?.code === 'PGRST116') return notFound()
  if (error) return serverError(error.message)
  return ok(data)
}

// ── PUT /api/tasks/[id] ──
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const supabase = createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const parsed = taskUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
  }

  const { id } = await params
  const { assignee_id, ...rest } = parsed.data
  const updatePayload = {
    ...rest,
    ...(assignee_id !== undefined ? { assignee_id: assignee_id || null } : {}),
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error?.code === 'PGRST116') return notFound()
  if (error) return serverError(error.message)
  return ok(data)
}

// ── DELETE /api/tasks/[id] ──
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const supabase = createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const { id } = await params
  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) return serverError(error.message)
  return noContent()
}
