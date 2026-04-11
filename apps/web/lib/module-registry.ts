/**
 * Registro de módulos de navegação — nível de aplicação.
 *
 * Especializa o `ModuleRegistry<T>` genérico de `@template/modules` para
 * trabalhar com `ModuleConfig` e `NavigationConfig` desta app.
 *
 * Uso típico (no servidor):
 * ```ts
 * import { moduleRegistry } from '@/lib/module-registry'
 * moduleRegistry.getEnabled() // ModuleConfig[]
 * moduleRegistry.toNavigationConfig() // NavigationConfig completo
 * ```
 */

import { ModuleRegistry } from '@template/modules'
import type {
  ModuleConfig,
  NavigationConfig,
  FilterConfig,
  CategoryConfig,
} from '@/config/navigation-schema'

class NavigationModuleRegistry extends ModuleRegistry<ModuleConfig> {
  private _filters: FilterConfig[] = []
  private _categories: CategoryConfig[] = []

  /**
   * Carrega módulos a partir de um array de ModuleConfig.
   * Chamado em `apps/web/config/modules/index.ts` na inicialização.
   */
  loadModules(modules: ModuleConfig[]): this {
    for (const m of modules) {
      this.register(m)
    }
    return this
  }

  /** Define os filtros do config de navegação */
  setFilters(filters: FilterConfig[]): this {
    this._filters = filters
    return this
  }

  /** Define as categorias do config de navegação */
  setCategories(categories: CategoryConfig[]): this {
    this._categories = categories
    return this
  }

  /**
   * Serializa o registry como NavigationConfig completo.
   * Usado como fallback em `/api/config/navigation` quando não há config no DB.
   */
  toNavigationConfig(): NavigationConfig {
    return {
      version: '1.0.0',
      appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'Template Platform',
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
      modules: this.getAll(),
      filters: this._filters,
      categories: this._categories,
      settings: {
        enableFavorites: true,
        enableGlobalSearch: true,
        enableKeyboardShortcuts: true,
        defaultTheme: 'system',
        defaultLanguage: 'pt-BR',
      },
      updatedAt: new Date().toISOString(),
    }
  }
}

/** Singleton — importado por toda a app server-side */
export const moduleRegistry = new NavigationModuleRegistry()
