/**
 * Inicialização do Module Registry — Sistema Modular v4.0
 *
 * Fluxo:
 * 1. Importar todos os manifests (*.manifest.ts)
 * 2. Aplicar overrides de modules.config.ts
 * 3. Resolver dependências (validação automática)
 * 4. Registrar módulos resolvidos no moduleRegistry singleton
 *
 * Uso em route handlers:
 * ```ts
 * import '@/config/modules'                 // side-effect: popula o registry
 * import { moduleRegistry } from '@/lib/module-registry'
 * const config = moduleRegistry.toNavigationConfig()
 * ```
 *
 * Uso direto do estado resolvido:
 * ```ts
 * import { resolvedModules, enabledModuleIds, isModuleEnabled } from '@/config/modules'
 * ```
 */

import { resolveModules } from '@template/modules'
import type { ModuleManifest } from '@template/modules'
import { DEFAULT_FILTERS, DEFAULT_CATEGORIES } from '@/config/navigation-default'
import type { ModuleConfig, FunctionConfig } from '@/config/navigation-schema'
import { moduleRegistry } from '@/lib/module-registry'
import { moduleOverrides } from '@/modules.config'

// ── Importar todos os manifests ──────────────────────────────

import authManifest from './auth.manifest'
import adminManifest from './admin.manifest'
import settingsManifest from './settings.manifest'
import searchManifest from './search.manifest'
import dashboardManifest from './dashboard.manifest'
import reportsManifest from './reports.manifest'
import tasksManifest from './tasks.manifest'
import supportManifest from './support.manifest'
import notificationsManifest from './notifications.manifest'
import featureFlagsManifest from './feature-flags.manifest'
import organizationsManifest from './organizations.manifest'
import fileUploadManifest from './file-upload.manifest'

const ALL_MANIFESTS: ModuleManifest[] = [
  authManifest,
  adminManifest,
  settingsManifest,
  searchManifest,
  dashboardManifest,
  reportsManifest,
  tasksManifest,
  supportManifest,
  notificationsManifest,
  featureFlagsManifest,
  organizationsManifest,
  fileUploadManifest,
]

// ── Resolver dependências e aplicar overrides ────────────────

const result = resolveModules(ALL_MANIFESTS, moduleOverrides)

// Logar erros de dependência (ajuda no debug)
if (result.errors.length > 0) {
  console.error('[modules] Erros de resolucao de modulos:')
  result.errors.forEach(e => console.error(`  - ${e}`))
}
if (result.warnings.length > 0) {
  result.warnings.forEach(w => console.warn(`[modules] ${w}`))
}

// ── Registrar módulos no registry existente (compatibilidade) ──

moduleRegistry.setFilters(DEFAULT_FILTERS).setCategories(DEFAULT_CATEGORIES)

for (const manifest of result.all) {
  // Converter manifest → ModuleConfig (compatível com o registry existente)
  const moduleConfig: ModuleConfig = {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    icon: manifest.icon,
    path: manifest.path,
    enabled: manifest.enabled,
    order: manifest.order,
    roles: manifest.roles as ModuleConfig['roles'],
    functions: manifest.functions as unknown as FunctionConfig[],
    showInSidebar: manifest.showInSidebar,
    showInFunctionsPanel: manifest.showInSidebar,
    group: manifest.group,
  }
  moduleRegistry.register(moduleConfig)
}

// ── Exports ──────────────────────────────────────────────────

/** Resultado completo da resolução de módulos */
export const resolvedModules = result

/** Set de IDs de módulos habilitados */
export const enabledModuleIds = result.enabledIds

/** Set de rotas habilitadas */
export const enabledRoutes = result.enabledRoutes

/** Set de prefixos de API habilitados */
export const enabledApiRoutes = result.enabledApiRoutes

/** Todos os manifests (para uso no wizard, docs, etc.) */
export const allManifests = ALL_MANIFESTS

/** Verifica se um módulo está habilitado */
export function isModuleEnabled(moduleId: string): boolean {
  return result.enabledIds.has(moduleId)
}

/** Encontra o manifest de um módulo pelo ID */
export function getManifest(moduleId: string): ModuleManifest | undefined {
  return ALL_MANIFESTS.find(m => m.id === moduleId)
}
