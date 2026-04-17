/**
 * GET /api/admin/agent/packs — lista os domain packs registrados.
 * ADMIN/GESTOR. Sem paginação — a quantidade é pequena (core + specializados).
 * Sprint 10: usado pelos dropdowns de filtro por pack no admin.
 */
import type { NextRequest } from 'next/server'
import {
  DomainPackRegistry,
  coreDomainPack,
  tasksDomainPack,
  supportDomainPack,
} from '@template/agent'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { ok, unauthorized, forbidden, tooManyRequests, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { isDemoMode } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

// Registry singleton local ao módulo (mesmo padrão do /api/agent/chat).
const _registry = (() => {
  const r = new DomainPackRegistry()
  r.register(coreDomainPack)
  r.register(tasksDomainPack)
  r.register(supportDomainPack)
  return r
})()

export const GET = withApiLog('admin-agent-packs', async function GET(request: NextRequest) {
  if (isDemoMode) {
    return ok({
      items: [
        {
          id: 'core',
          version: '1.0.0',
          display_name: 'Assistente Base',
          app_ids: ['*'],
          authorized_tool_count: 0,
        },
      ],
    })
  }

  const ip = getClientIp(request.headers)
  const { success } = await rateLimit(ip, { windowMs: 60_000, max: 60 })
  if (!success) return tooManyRequests()

  const { user } = await getAuthGateway().getUser()
  if (!user) return unauthorized()
  if (user.role !== 'ADMIN' && user.role !== 'GESTOR') return forbidden('Acesso restrito')

  try {
    const items = _registry.list().map(p => ({
      id: p.identity.id,
      version: p.identity.version,
      display_name: p.identity.displayName,
      app_ids: p.identity.appIds,
      authorized_tool_count: p.authorizedSources?.internalTools?.length ?? 0,
    }))
    return ok({ items })
  } catch (err) {
    console.error('[admin/agent/packs]', err)
    return serverError()
  }
})
