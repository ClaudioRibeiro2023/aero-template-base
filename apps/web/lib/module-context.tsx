'use client'

/**
 * Module Context — provê estado de módulos habilitados para componentes React.
 *
 * Combina módulos habilitados em build-time (modules.config.ts) com
 * feature flags em runtime (flag `module.<id>` pode desabilitar módulo).
 *
 * Uso:
 * ```tsx
 * // Em providers.tsx:
 * <ModuleProvider enabledModules={['auth', 'dashboard', 'tasks']}>
 *   {children}
 * </ModuleProvider>
 *
 * // Em qualquer componente:
 * const enabled = useModuleEnabled('tasks') // true/false
 * ```
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'

interface ModuleContextValue {
  /** Set de IDs de módulos habilitados (build-time) */
  enabledModules: Set<string>
  /** Verifica se um módulo está habilitado (build-time only) */
  isEnabled: (moduleId: string) => boolean
}

const ModuleContext = createContext<ModuleContextValue>({
  enabledModules: new Set(),
  isEnabled: () => true, // fallback: tudo habilitado se fora do provider
})

interface ModuleProviderProps {
  /** Lista de IDs de módulos habilitados */
  enabledModules: string[]
  children: ReactNode
}

export function ModuleProvider({ enabledModules, children }: ModuleProviderProps) {
  const value = useMemo<ModuleContextValue>(() => {
    const set = new Set(enabledModules)
    return {
      enabledModules: set,
      isEnabled: (id: string) => set.has(id),
    }
  }, [enabledModules])

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>
}

/**
 * Hook para verificar se um módulo está habilitado.
 * Combina: build-time config (ModuleProvider) + runtime feature flag.
 *
 * Se a feature flag `module.<id>` existir e for false, o módulo
 * é desabilitado em runtime mesmo que modules.config.ts diga enabled.
 * Isso permite rollout gradual via feature flags.
 *
 * Retorna true se o módulo está ativo, false caso contrário.
 */
export function useModuleEnabled(moduleId: string): boolean {
  const { isEnabled } = useContext(ModuleContext)
  const buildTimeEnabled = isEnabled(moduleId)

  // Se desabilitado em build-time, não precisa checar feature flag
  if (!buildTimeEnabled) return false

  // Runtime override via feature flags
  // Flag `module.<id>` pode desabilitar em runtime (rollout gradual)
  try {
    const { featureFlags } = require('@template/shared/features')
    const flagKey = `module.${moduleId}`
    // Se a flag existe e está explicitamente false, desabilita
    const allFlags = featureFlags.getAllFlags() as Record<string, boolean>
    if (flagKey in allFlags && allFlags[flagKey] === false) {
      return false
    }
  } catch {
    // Feature flags não disponíveis — usa apenas build-time config
  }

  return true
}

/**
 * Hook que retorna o set completo de módulos habilitados.
 */
export function useEnabledModules(): Set<string> {
  const { enabledModules } = useContext(ModuleContext)
  return enabledModules
}
