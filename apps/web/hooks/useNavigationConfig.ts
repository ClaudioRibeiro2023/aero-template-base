/**
 * useNavigationConfig Hook
 *
 * Hook para carregar e gerenciar a configuração de navegação.
 * Preparado para:
 * - Configuração local (fallback)
 * - Configuração via API (futuro)
 * - Cache em localStorage
 * - Invalidação e refresh
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  /** Configuração completa */
  config: NavigationConfig

  /** Módulos filtrados por permissão */
  authorizedModules: ModuleConfig[]

  /** Filtros ativos */
  filters: FilterConfig[]

  /** Categorias ordenadas */
  categories: CategoryConfig[]

  /** Se está carregando */
  isLoading: boolean

  /** Erro ao carregar */
  error: Error | null

  /** Recarregar configuração */
  refresh: () => Promise<void>

  /** Obter módulo por ID */
  getModule: (id: string) => ModuleConfig | undefined

  /** Obter módulo por path */
  getModuleByPath: (path: string) => ModuleConfig | undefined

  /** Obter funções autorizadas de um módulo */
  getModuleFunctions: (moduleId: string) => FunctionConfig[]

  /** Obter filtros aplicáveis a um módulo/função */
  getApplicableFilters: (moduleId?: string, functionId?: string) => FilterConfig[]
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const CACHE_KEY = 'navigation-config-cache'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useNavigationConfig(): UseNavigationConfigReturn {
  const { hasAnyRole } = useAuth()
  const [config, setConfig] = useState<NavigationConfig>(DEFAULT_NAVIGATION_CONFIG)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // ─────────────────────────────────────────────────────────────
  // Carregar configuração
  // ─────────────────────────────────────────────────────────────

  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Tentar carregar do cache primeiro
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          setConfig(data)
          setIsLoading(false)
          return
        }
      }

      // TODO: Quando API estiver pronta, descomentar:
      // const response = await fetch('/api/config/navigation')
      // if (response.ok) {
      //   const data = await response.json()
      //   setConfig(data)
      //   localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
      //   return
      // }

      // Fallback para config local
      setConfig(DEFAULT_NAVIGATION_CONFIG)
    } catch (err) {
      console.error('[useNavigationConfig] Erro ao carregar:', err)
      setError(err instanceof Error ? err : new Error('Erro ao carregar configuração'))
      // Usar config padrão em caso de erro
      setConfig(DEFAULT_NAVIGATION_CONFIG)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carregar na montagem
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // ─────────────────────────────────────────────────────────────
  // Filtrar módulos por permissão
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
      // e.g. /admin/config matches Configurações, not Administração (/admin)
      const candidates = config.modules.filter(
        m => path === m.path || path.startsWith(m.path + '/')
      )
      if (candidates.length === 0) return undefined
      // Sort by path length descending → most specific wins
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
        // Filtros globais
        if (filter.appliesTo.global) return true

        // Filtros de módulo
        if (moduleId && filter.appliesTo.modules?.includes(moduleId)) return true

        // Filtros de função
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
    error,
    refresh: loadConfig,
    getModule,
    getModuleByPath,
    getModuleFunctions,
    getApplicableFilters,
  }
}

export default useNavigationConfig
