/**
 * GET  /api/etl   — lista jobs de importação com filtros
 * POST /api/etl   — inicia novo job de importação
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

const createJobSchema = z.object({
  sourceId: z.string().uuid(),
  options: z.record(z.unknown()).optional(),
})

export const GET = withApiLog('etl', async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(url.searchParams.get('page_size') ?? '20', 10))
  )

  try {
    // TODO: const jobs = getRepository('etl_jobs')
    // const result = await jobs.findMany({ filters: status ? [{ field: 'status', operator: 'eq', value: status }] : [], page, pageSize })
    return ok([], { page, page_size: pageSize, total: 0, pages: 0 })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro interno')
  }
})

export const POST = withApiLog('etl', async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 10 })
  if (!success) return tooManyRequests()

  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const body = await requireJson(request)
  if (!body) return badRequest('Body inválido')

  const parsed = createJobSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.message)

  try {
    // TODO: Criar job no Supabase e enfileirar processamento
    const job = {
      id: crypto.randomUUID(),
      status: 'pending',
      ...parsed.data,
      createdAt: new Date().toISOString(),
    }
    return created(job)
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro interno')
  }
})
