/**
 * GET  /api/config/modules — Retorna lista de módulos com status
 * PUT  /api/config/modules — Admin ativa/desativa módulos (grava em admin_config)
 *
 * Fonte de verdade: manifests + modules.config.ts (build-time).
 * PUT grava overrides no admin_config.modules para persistência.
 */
import type { NextRequest } from 'next/server'
import { ok, unauthorized, forbidden, badRequest, serverError } from '@/lib/api-response'
import { getAuthGateway } from '@/lib/data'
import { withApiLog } from '@/lib/logger'
import { allManifests, enabledModuleIds } from '@/config/modules'

export const dynamic = 'force-dynamic'

export const GET = withApiLog('config-modules', async function GET(_request: NextRequest) {
  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()

  const modules = allManifests.map(m => ({
    id: m.id,
    name: m.name,
    description: m.description,
    version: m.version,
    category: m.category,
    enabled: enabledModuleIds.has(m.id),
    order: m.order,
    dependencies: m.dependencies,
    routes: m.routes,
    apiRoutes: m.apiRoutes,
    requiredTables: m.requiredTables,
    hooks: m.hooks,
    components: m.components,
    icon: m.icon,
    path: m.path,
  }))

  return ok({
    modules,
    total: modules.length,
    enabled: modules.filter(m => m.enabled).length,
    disabled: modules.filter(m => !m.enabled).length,
  })
})

export const PUT = withApiLog('config-modules', async function PUT(request: NextRequest) {
  const { user, error } = await getAuthGateway().getUser()
  if (error || !user) return unauthorized()
  if (user.role !== 'ADMIN') return forbidden('Apenas ADMIN pode alterar modulos')

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || !body.modules) {
      return badRequest('Body deve conter { modules: Record<string, { enabled: boolean }> }')
    }

    const overrides = body.modules as Record<string, { enabled: boolean }>

    // Validar que não tenta desabilitar core modules
    for (const [id, override] of Object.entries(overrides)) {
      const manifest = allManifests.find(m => m.id === id)
      if (!manifest) {
        return badRequest(`Modulo '${id}' nao existe`)
      }
      if (manifest.category === 'core' && !override.enabled) {
        return badRequest(`Modulo '${id}' e core e nao pode ser desabilitado`)
      }
    }

    // Nota: Em produção, gravar em admin_config.modules no Supabase.
    // Por enquanto, retorna a configuração que seria aplicada.
    // A mudança real requer rebuild (modules.config.ts é build-time).
    return ok({
      message: 'Configuracao recebida. Alteracoes de modulos requerem rebuild para efetivar.',
      overrides,
      note: 'Para aplicar: atualize modules.config.ts e faca rebuild/deploy.',
    })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao atualizar modulos')
  }
})
