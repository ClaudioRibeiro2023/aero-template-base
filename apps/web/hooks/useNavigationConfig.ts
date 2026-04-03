/**
 * useNavigationConfig Hook
 *
 * Hook para carregar e gerenciar a configuracao de navegacao.
 * Sprint 5: Migrated to React Query for consistency.
 */

import { useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth, type UserRole } from '@template/shared'
import type {
  NavigationConfig,
  ModuleConfig,
  FunctionConfig,
  FilterConfig,
  CategoryConfig,
} from '@/config/navigation-schema'
import { DEFAULT_NAVIGATION_CONFIG } from '@/config/navigation-default'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface UseNavigationConfigReturn {
  /** Configuracao completa */
  config: NavigationConfig

  /** Modulos filtrados por permissao */
  authorizedModules: ModuleConfig[]

  /** Filtros ativos */
  filters: FilterConfig[]

  /** Categorias ordenadas */
  categories: CategoryConfig[]

  /** Se esta carregando */
  isLoading: boolean

  /** Erro ao carregar */
  error: Error | null

  /** Recarregar configuracao */
  refresh: () => Promise<void>

  /** Obter modulo por ID */
  getModule: (id: string) => ModuleConfig | undefined

  /** Obter modulo por path */
  getModuleByPath: (path: string) => ModuleConfig | undefined

  /** Obter funcoes autorizadas de um modulo */
  getModuleFunctions: (moduleId: string) => FunctionConfig[]

  /** Obter filtros aplicaveis a um modulo/funcao */
  getApplicableFilters: (moduleId?: string, functionId?: string) => FilterConfig[]
}

// ═══════════════════════════════════════════════════════════════
// QUERY KEYS
// ═══════════════════════════════════════════════════════════════

const navKeys = {
  config: ['navigation-config'] as const,
}

// ═══════════════════════════════════════════════════════════════
// FETCH FUNCTION
// ═══════════════════════════════════════════════════════════════

async function fetchNavigationConfig(): Promise<NavigationConfig> {
  try {
    const response = await fetch('/api/config/navigation')
    if (response.ok) {
      const json = (await response.json()) as { data?: { navigation: unknown } }
      const nav = json?.data?.navigation
      if (nav) {
        return {
          ...DEFAULT_NAVIGATION_CONFIG,
          modules: nav as typeof DEFAULT_NAVIGATION_CONFIG.modules,
        }
      }
    }
  } catch {
    // Silently fall back to default config
  }
  return DEFAULT_NAVIGATION_CONFIG
}

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useNavigationConfig(): UseNavigationConfigReturn {
  const { hasAnyRole } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: config = DEFAULT_NAVIGATION_CONFIG,
    isLoading,
    error,
  } = useQuery<NavigationConfig>({
    queryKey: navKeys.config,
    queryFn: fetchNavigationConfig,
    staleTime: 5 * 60 * 1000,
    initialData: DEFAULT_NAVIGATION_CONFIG,
  })

  // ─────────────────────────────────────────────────────────────
  // Refresh via invalidation
  // ─────────────────────────────────────────────────────────────

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: navKeys.config })
  }, [queryClient])

  // ─────────────────────────────────────────────────────────────
  // Filtrar modulos por permissao
  // ─────────────────────────────────────────────────────────────

  const authorizedModules = useMemo(() => {
    return config.modules
      .filter(module => {
        if (!module.enabled) return false
        if (module.roles.length === 0) return true
        return hasAnyRole(module.roles as UserRole[])
      })
      .sort((a, b) => a.order - b.order)
  }, [config.modules, hasAnyRole])

  // ─────────────────────────────────────────────────────────────
  // Filtros ativos
  // ─────────────────────────────────────────────────────────────

  const filters = useMemo(() => {
    return config.filters.filter(f => f.enabled).sort((a, b) => a.order - b.order)
  }, [config.filters])

  // ─────────────────────────────────────────────────────────────
  // Categorias ordenadas
  // ─────────────────────────────────────────────────────────────

  const categories = useMemo(() => {
    return [...config.categories].sort((a, b) => a.order - b.order)
  }, [config.categories])

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  const getModule = useCallback(
    (id: string) => {
      return config.modules.find(m => m.id === id)
    },
    [config.modules]
  )

  const getModuleByPath = useCallback(
    (path: string) => {
      // Match the most specific (longest path) module first
      const candidates = config.modules.filter(
        m => path === m.path || path.startsWith(m.path + '/')
      )
      if (candidates.length === 0) return undefined
      return candidates.sort((a, b) => b.path.length - a.path.length)[0]
    },
    [config.modules]
  )

  const getModuleFunctions = useCallback(
    (moduleId: string): FunctionConfig[] => {
      const module = config.modules.find(m => m.id === moduleId)
      if (!module) return []

      return module.functions
        .filter(func => {
          if (!func.enabled) return false
          if (func.roles.length === 0) return true
          return hasAnyRole(func.roles as UserRole[])
        })
        .sort((a, b) => a.order - b.order)
    },
    [config.modules, hasAnyRole]
  )

  const getApplicableFilters = useCallback(
    (moduleId?: string, functionId?: string): FilterConfig[] => {
      return filters.filter(filter => {
        if (filter.appliesTo.global) return true
        if (moduleId && filter.appliesTo.modules?.includes(moduleId)) return true
        if (functionId && filter.appliesTo.functions?.includes(functionId)) return true
        return false
      })
    },
    [filters]
  )

  // ─────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────

  return {
    config,
    authorizedModules,
    filters,
    categories,
    isLoading,
    error: error ?? null,
    refresh,
    getModule,
    getModuleByPath,
    getModuleFunctions,
    getApplicableFilters,
  }
}

export default useNavigationConfig
