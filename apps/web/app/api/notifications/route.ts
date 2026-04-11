/**
 * GET/POST /api/notifications — Listar e criar notificações in-app
 *
 * v3.0: Migrado para @template/data repository pattern.
 */
import type { NextRequest } from 'next/server'
import { ok, badRequest, unauthorized, serverError } from '@/lib/api-response'
import { getRepository, getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('notifications-list', async function GET() {
  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  try {
    const notifications = getRepository('notifications')
    const result = await notifications.findByUser(user.id)
    return ok({ data: result.data })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao listar notificações')
  }
})

export const POST = withApiLog('notifications-create', async function POST(request: NextRequest) {
  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const body = await request.json().catch(() => null)
  if (!body) return badRequest('Body inválido')

  const { title, message, severity } = body as {
    title?: string
    message?: string
    severity?: string
  }

  if (!title || !message) return badRequest('title e message são obrigatórios')

  const validSeverities = ['info', 'success', 'warning', 'error']
  if (severity && !validSeverities.includes(severity)) {
    return badRequest(`severity inválido. Válidos: ${validSeverities.join(', ')}`)
  }

  try {
    const notifications = getRepository('notifications')
    const data = await notifications.create({
      user_id: user.id,
      title,
      message,
      severity: (severity || 'info') as 'info' | 'success' | 'warning' | 'error',
    })
    return ok(data)
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao criar notificação')
  }
})
