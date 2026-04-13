/**
 * GET  /api/users  — lista profiles (ADMIN only)
 * POST /api/users  — cria novo usuario + profile (ADMIN only)
 *
 * v3.0: Migrado para @template/data repository pattern.
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
import { getRepository, getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode, DEMO_USERS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

// ── GET /api/users ──
export const GET = withApiLog('users', async function GET(request: NextRequest) {
  if (isDemoMode) {
    // usersService.list uses fetchJson which unwraps json.data,
    // then accesses res.data and res.meta — so we nest accordingly
    return ok({
      data: DEMO_USERS,
      meta: { page: 1, page_size: 20, total: DEMO_USERS.length, pages: 1 },
    })
  }

  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error: authError } = await getAuthGateway().getUser()
  if (!user) return unauthorized(authError ?? undefined)
  if (user.role !== 'ADMIN' && user.role !== 'GESTOR')
    return forbidden('Acesso restrito a administradores')

  const url = new URL(request.url)
  const search = url.searchParams.get('search')
  const role = url.searchParams.get('role')
  const activeOnly = url.searchParams.get('active_only')
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '20', 10))
  )

  try {
    const users = getRepository('users')

    // Search com or() requer acesso direto ao client por ora
    // (IRepository não suporta OR nativo — será adicionado em versão futura)
    if (search) {
      const { SupabaseDbClient } = await import('@template/data/supabase')
      const db = new SupabaseDbClient()
      const client = await db.asUser()

      const safe = search
        .slice(0, 50)
        .replace(/[%_]/g, '')
        .replace(/[,.()"'\\]/g, '')

      let query = client
        .from('profiles')
        .select(
          'id, email, display_name, avatar_url, phone, department, role, is_active, tenant_id, created_at, updated_at',
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1)

      if (safe) query = query.or(`display_name.ilike.%${safe}%,email.ilike.%${safe}%`)
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

    // Sem search: usa repository puro
    const filters = [
      ...(role ? [{ field: 'role', operator: 'eq' as const, value: role }] : []),
      ...(activeOnly === 'true'
        ? [{ field: 'is_active', operator: 'eq' as const, value: true }]
        : []),
    ]

    const result = await users.findMany({
      filters,
      sort: [{ field: 'created_at', ascending: false }],
      pagination: { page, pageSize },
    })

    return ok(result.data, {
      page,
      page_size: pageSize,
      total: result.total,
      pages: result.pages,
    })
  } catch (err) {
    console.error('[users/GET]', err)
    return serverError()
  }
})

// ── POST /api/users ──
export const POST = withApiLog('users', async function POST(request: NextRequest) {
  if (isDemoMode) {
    const body = await request.json().catch(() => ({}))
    return created({
      id: `demo-user-${Date.now()}`,
      ...body,
      is_active: true,
      tenant_id: 'demo-tenant',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  const jsonError = requireJson(request)
  if (jsonError) return jsonError

  const ip = getClientIp(request.headers)
  const { success } = rateLimit(ip, { windowMs: 60_000, max: 15 })
  if (!success) return tooManyRequests()

  const { user, error: authError } = await getAuthGateway().getUser()
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

  try {
    const users = getRepository('users')
    const profile = await users.createWithAuth(parsed.data)
    return created(profile)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg.includes('already been registered')) {
      return badRequest('Este email ja esta cadastrado')
    }
    console.error('[users/POST]', err)
    return serverError()
  }
})
