/**
 * GET  /api/template  — lista itens com paginação e filtros
 * POST /api/template  — cria novo item
 *
 * Padrão: auth guard + rate-limit + logging + demo mode
 * Substitua "template" pelo nome do seu módulo.
 */
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireJson } from '@/lib/api-guard'
import {
  ok,
  created,
  badRequest,
  unauthorized,
  tooManyRequests,
  serverError,
} from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('pending'),
})

// ── GET /api/template ──
export const GET = withApiLog('template', async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 120 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const url = new URL(request.url)
  const search = url.searchParams.get('search') ?? ''
  const status = url.searchParams.get('status') ?? ''
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '20', 10))
  )

  try {
    // TODO: substituir pelo repository do seu módulo
    // const repo = getRepository('template_items')
    // const result = await repo.findMany({ filters: [...], page, pageSize })
    const items: unknown[] = []
    return ok(items, { page, page_size: pageSize, total: 0, pages: 0 })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro interno')
  }
})

// ── POST /api/template ──
export const POST = withApiLog('template', async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 30 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const body = await requireJson(request)
  if (!body) return badRequest('Body inválido')

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.message)

  try {
    // TODO: substituir pelo repository do seu módulo
    // const repo = getRepository('template_items')
    // const item = await repo.create({ ...parsed.data, userId: user.id })
    const item = {
      id: crypto.randomUUID(),
      ...parsed.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return created(item)
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro interno')
  }
})
