/**
 * GET  /api/tasks     — lista tasks do usuário autenticado
 * POST /api/tasks     — cria nova task
 *
 * Sprint 7 (P1-01): CRUD de referência com Supabase real.
 * Demonstra: server client, RLS, Zod validation, ApiResponse padrão.
 */
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { taskCreateSchema } from '@template/shared/schemas'
import {
  ok,
  created,
  badRequest,
  unauthorized,
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

// ── GET /api/tasks ──
export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 120 })
  if (!success) return tooManyRequests()

  const supabase = createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return unauthorized()

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const priority = url.searchParams.get('priority')
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '20', 10))
  )

  let query = supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)

  const { data, error, count } = await query
  if (error) return serverError(error.message)

  return ok(data, {
    page,
    page_size: pageSize,
    total: count ?? 0,
    pages: Math.ceil((count ?? 0) / pageSize),
  })
}

// ── POST /api/tasks ──
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 30 })
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

  const parsed = taskCreateSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Dados inválidos', parsed.error.flatten().fieldErrors)
  }

  const { assignee_id, ...rest } = parsed.data
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...rest,
      assignee_id: assignee_id || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return serverError(error.message)
  return created(data)
}
