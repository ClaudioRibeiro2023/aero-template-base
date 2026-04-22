/**
 * GET  /api/exemplo  — lista itens de exemplo (CRUD de referência)
 * POST /api/exemplo  — cria novo item de exemplo
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

export const GET = withApiLog('exemplo', async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 120 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '20', 10))
  )

  try {
    // TODO: getRepository('example_items').findMany(...)
    const items = [
      {
        id: '1',
        title: 'Item de exemplo 1',
        description: 'Descrição do item',
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: '2',
        title: 'Item de exemplo 2',
        description: 'Outro item',
        status: 'pending',
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      },
    ].filter(i => !status || i.status === status)

    return ok(items, { page, page_size: pageSize, total: items.length, pages: 1 })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro interno')
  }
})

export const POST = withApiLog('exemplo', async function POST(request: NextRequest) {
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
