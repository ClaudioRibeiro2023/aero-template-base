/**
 * POST /api/agent/actions/confirm
 *
 * Confirma e executa uma ação pendente do agente.
 * Sprint 6: confirmação transacional de tools de escrita.
 *
 * Fluxo:
 * 1. Validar autenticação
 * 2. Validar pending action (ownership, tenant, expiry, status)
 * 3. Marcar como confirmed
 * 4. Executar a tool em modo 'execute'
 * 5. Marcar como executed + persistir resultado
 * 6. Retornar resultado
 */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ToolRegistry } from '@template/agent'
import { domainTools } from '@/lib/agent-tools'
import { getAuthGateway } from '@/lib/data'
import { isValidTenantId } from '@/lib/agent-session-store'
import { PendingActionStore } from '@/lib/agent-pending-action-store'
import { getAgentRateLimiter } from '@/lib/agent-rate-limiter'
import { badRequest, unauthorized, serverError } from '@/lib/api-response'

const ConfirmSchema = z.object({
  actionId: z.string().uuid(),
})

// ─── Singleton tools registry (same tools as chat route) ─────────────────────
const _tools = (() => {
  const registry = new ToolRegistry()
  registry.registerAll(domainTools)
  return registry
})()

export async function POST(req: NextRequest) {
  // 1. Auth
  const { user } = await getAuthGateway().getUser()
  if (!user) return unauthorized()

  const tenantId = isValidTenantId(user.tenantId) ? user.tenantId : null
  if (!tenantId) {
    return badRequest('Confirmação requer tenant válido')
  }

  // Rate limit
  const limiter = getAgentRateLimiter()
  const rateCheck = limiter.check(tenantId, user.id, 'confirm')
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { ok: false, error: { message: 'Rate limit excedido. Aguarde antes de tentar novamente.' } },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) } }
    )
  }

  // 2. Parse body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return badRequest('Body inválido')
  }

  const parsed = ConfirmSchema.safeParse(body)
  if (!parsed.success) {
    return badRequest(parsed.error.issues.map(i => i.message).join(', '))
  }

  const { actionId } = parsed.data

  // 3. Find and validate pending action
  const store = new PendingActionStore()
  const { action, error: findError } = await store.findForConfirmation(actionId, user.id, tenantId)
  if (!action) {
    return NextResponse.json(
      { ok: false, error: { message: findError ?? 'Ação não encontrada' } },
      { status: 400 }
    )
  }

  // 4. Mark as confirmed
  await store.confirm(actionId)

  // 5. Execute the tool in 'execute' mode
  try {
    const result = await _tools.execute(action.toolName, action.proposedInput, {
      userId: user.id,
      tenantId,
      userRole: (user.role ?? 'VIEWER').toLowerCase(),
      appId: action.appId,
      sessionId: action.sessionId,
      traceId: actionId, // Use actionId as traceId for correlation
      mode: 'execute',
    })

    if (result.success) {
      await store.markExecuted(actionId, result.data)
      return NextResponse.json({
        ok: true,
        data: {
          actionId,
          toolName: action.toolName,
          status: 'executed',
          result: result.data,
        },
      })
    } else {
      await store.markExecuted(actionId, null, result.error)
      return NextResponse.json(
        {
          ok: false,
          error: { message: result.error, code: result.code },
          data: { actionId, toolName: action.toolName, status: 'failed' },
        },
        { status: 400 }
      )
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao executar ação'
    await store.markExecuted(actionId, null, msg)
    return serverError(msg)
  }
}
