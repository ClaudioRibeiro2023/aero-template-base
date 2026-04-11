/**
 * Inicialização do Module Registry — carrega todos os módulos padrão.
 *
 * Importar este arquivo em qualquer Server Component ou route handler
 * garante que o registry esteja populado antes do primeiro uso.
 *
 * Estratégia v3.0:
 * - Módulos padrão: carregados de DEFAULT_MODULES (navigation-default.ts)
 *   para retrocompatibilidade total.
 * - Módulos isolados: exemplificado por tasks.module.ts. Em apps derivadas,
 *   substituir a entrada no DEFAULT_MODULES pelo arquivo isolado.
 *
 * Uso em route handlers:
 * ```ts
 * import '@/config/modules'              // side-effect: popula o registry
 * import { moduleRegistry } from '@/lib/module-registry'
 * const config = moduleRegistry.toNavigationConfig()
 * ```
 */

import { DEFAULT_MODULES, DEFAULT_FILTERS, DEFAULT_CATEGORIES } from '@/config/navigation-default'
import { moduleRegistry } from '@/lib/module-registry'

// Carrega filtros e categorias padrão
moduleRegistry.setFilters(DEFAULT_FILTERS).setCategories(DEFAULT_CATEGORIES)

// Carrega todos os módulos padrão (retrocompatibilidade)
// Em apps derivadas: substituir entradas específicas por módulos isolados
for (const module of DEFAULT_MODULES) {
  if (!moduleRegistry.has(module.id)) {
    moduleRegistry.register(module)
  }
}

// Re-exporta os módulos isolados para que seus side-effects (defineModule)
// sejam executados antes que o registry seja consumido.
// Módulos isolados sobrescrevem os defaults de mesmo id.
export * from './tasks.module'
