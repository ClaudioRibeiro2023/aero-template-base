/**
 * GET  /api/users  — lista profiles (ADMIN only)
 * POST /api/users  — cria novo usuario + profile (ADMIN only)
 *
 * Megaplan V4 Sprint A: Users CRUD real.
 */
import type { NextRequest } from 'next/server'
import { userCreateSchema } from '@template/shared/schemas'
import { requireJson } from '@/lib/api-guard'
import {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  tooManyRequests,
  serverError,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getAuthUser } from '@/lib/auth-guard'
import { createServerSupabase } from '@/app/lib/supabase-server'

export const dynamic = 'force-dynamic'

// ── GET /api/users ──
export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error: authError } = await getAuthUser()
  if (!user) return unauthorized(authError ?? undefined)
  if (user.role !== 'ADMIN' && user.role !== 'GESTOR')
    return forbidden('Acesso restrito a administradores')

  const supabase = createServerSupabase()

  const url = new URL(request.url)
  const search = url.searchParams.get('search')
  const role = url.searchParams.get('role')
  const activeOnly = url.searchParams.get('active_only')
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '20', 10))
  )

  let query = supabase
    .from('profiles')
    .select(
      'id, email, display_name, avatar_url, phone, department, role, is_active, tenant_id, created_at, updated_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (search) {
    // Sanitize: escape SQL wildcards + remove PostgREST special chars, limit length
    const safe = search
      .slice(0, 50)
      .replace(/[%_]/g, '')
      .replace(/[,.()"'\\]/g, '')
    if (safe) query = query.or(`display_name.ilike.%${safe}%,email.ilike.%${safe}%`)
  }
  if (role) query = query.eq('role', role)
  if (activeOnly === 'true') query = query.eq('is_active', true)

  const { data, error, count } = await query
  if (error) {
    console.error('[users/GET]', error)
    return serverError()
  }

  return ok(data, {
    page,
    page_size: pageSize,
    total: count ?? 0,
    pages: Math.ceil((count ?? 0) / pageSize),
  })
}

// ── POST /api/users ──
export async function POST(request: NextRequest) {
  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 15 })
  if (!success) return tooManyRequests()

  const { user, error: authError } = await getAuthUser()
  if (!user) return unauthorized(authError ?? undefined)
  if (user.role !== 'ADMIN') return forbidden('Apenas administradores podem criar usuarios')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('JSON invalido')
  }

  const parsed = userCreateSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest('Dados invalidos', parsed.error.flatten().fieldErrors)
  }

  const supabase = createServerSupabase()
  const { display_name, email, role: userRole, is_active, phone, department } = parsed.data

  // 1. Criar auth user via admin API
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { display_name },
    app_metadata: { role: userRole },
  })

  if (authErr) {
    if (authErr.message.includes('already been registered')) {
      return badRequest('Este email ja esta cadastrado')
    }
    console.error('[users/POST] auth', authErr)
    return serverError()
  }

  // 2. Atualizar profile (trigger handle_new_user ja criou o basico)
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .update({
      display_name,
      role: userRole,
      is_active,
      phone: phone || null,
      department: department || null,
    })
    .eq('id', authData.user.id)
    .select(
      'id, email, display_name, avatar_url, phone, department, role, is_active, tenant_id, created_at, updated_at'
    )
    .single()

  if (profileErr) {
    console.error('[users/POST] profile', profileErr)
    return serverError()
  }

  return created(profile)
}
