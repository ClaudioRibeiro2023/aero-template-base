/**
 * GET /api/search?q=term&limit=8 — Busca global cross-entity
 *
 * Busca em paralelo: profiles, support_tickets, tasks.
 * Retorna resultados unificados com tipo, título, e path para navegação.
 *
 * v3.0: Migrado para @template/data auth gateway + SupabaseDbClient.
 */
import type { NextRequest } from 'next/server'
import { SupabaseDbClient } from '@template/data/supabase'
import { ok, badRequest, unauthorized, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode, DEMO_TASKS, DEMO_USERS, DEMO_TICKETS } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

interface SearchResult {
  id: string
  type: 'user' | 'ticket' | 'task'
  title: string
  description?: string
  path: string
}

export const GET = withApiLog('global-search', async function GET(request: NextRequest) {
  if (isDemoMode) {
    const q = request.nextUrl.searchParams.get('q')?.trim()?.toLowerCase()
    if (!q || q.length < 2) return badRequest('q deve ter pelo menos 2 caracteres')
    const results: SearchResult[] = []
    for (const u of DEMO_USERS) {
      if (u.display_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) {
        results.push({
          id: `user-${u.id}`,
          type: 'user',
          title: u.display_name,
          description: `${u.role} — ${u.email}`,
          path: `/admin/usuarios?search=${encodeURIComponent(u.display_name)}`,
        })
      }
    }
    for (const t of DEMO_TASKS) {
      if (t.title.toLowerCase().includes(q)) {
        results.push({
          id: `task-${t.id}`,
          type: 'task',
          title: t.title,
          description: `${t.status} — ${t.priority}`,
          path: `/tasks/${t.id}`,
        })
      }
    }
    for (const t of DEMO_TICKETS) {
      if (t.title.toLowerCase().includes(q)) {
        results.push({
          id: `ticket-${t.id}`,
          type: 'ticket',
          title: t.title,
          description: `${t.status} — ${t.priority}`,
          path: `/support/tickets/${t.id}`,
        })
      }
    }
    return ok({ data: results.slice(0, 8) })
  }

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const q = request.nextUrl.searchParams.get('q')?.trim()
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') ?? '8', 10), 20)

  if (!q || q.length < 2) return badRequest('q deve ter pelo menos 2 caracteres')

  try {
    const db = new SupabaseDbClient()
    const client = await db.asUser()
    const searchTerm = `%${q}%`

    // Busca em paralelo
    const [usersResult, ticketsResult, tasksResult] = await Promise.all([
      client
        .from('profiles')
        .select('id, display_name, email, role')
        .or(`display_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .limit(limit),

      client
        .from('support_tickets')
        .select('id, title, status, priority')
        .or(`title.ilike.${searchTerm}`)
        .limit(limit),

      client
        .from('tasks')
        .select('id, title, status, priority')
        .or(`title.ilike.${searchTerm}`)
        .limit(limit),
    ])

    const results: SearchResult[] = []

    // Users
    if (usersResult.data) {
      for (const u of usersResult.data) {
        results.push({
          id: `user-${u.id}`,
          type: 'user',
          title: u.display_name || u.email,
          description: `${u.role} — ${u.email}`,
          path: `/admin/usuarios?search=${encodeURIComponent(u.display_name || u.email)}`,
        })
      }
    }

    // Tickets
    if (ticketsResult.data) {
      for (const t of ticketsResult.data) {
        results.push({
          id: `ticket-${t.id}`,
          type: 'ticket',
          title: t.title,
          description: `${t.status} — ${t.priority}`,
          path: `/support/tickets/${t.id}`,
        })
      }
    }

    // Tasks
    if (tasksResult.data) {
      for (const t of tasksResult.data) {
        results.push({
          id: `task-${t.id}`,
          type: 'task',
          title: t.title,
          description: `${t.status} — ${t.priority}`,
          path: `/tasks/${t.id}`,
        })
      }
    }

    return ok({ data: results.slice(0, limit) })
  } catch (err) {
    return serverError('Erro na busca global')
  }
})
