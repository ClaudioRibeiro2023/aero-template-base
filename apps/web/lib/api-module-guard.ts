/**
 * API Module Guard — defesa em profundidade para rotas de API.
 *
 * Wrapper que verifica se o módulo está habilitado antes de executar o handler.
 * O middleware já faz gating, mas este guard é segurança adicional para
 * rotas de módulos opcionais.
 *
 * Uso:
 * ```ts
 * export const GET = withModuleGuard('tasks', withApiLog('tasks', async function GET(req) {
 *   // handler normal
 * }))
 * ```
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isModuleEnabled } from '@/config/modules'

type RouteHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse> | NextResponse

/**
 * Wraps um route handler com verificação de módulo.
 * Retorna 404 se o módulo estiver desabilitado.
 */
export function withModuleGuard(moduleId: string, handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    if (!isModuleEnabled(moduleId)) {
      return NextResponse.json(
        {
          error: 'Module not available',
          module: moduleId,
          message: `O modulo '${moduleId}' nao esta habilitado nesta instalacao`,
        },
        { status: 404 }
      )
    }
    return handler(request, context)
  }
}
