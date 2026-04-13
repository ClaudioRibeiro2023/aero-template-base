'use client'

/**
 * Module Context — provê estado de módulos habilitados para componentes React.
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
  /** Set de IDs de módulos habilitados */
  enabledModules: Set<string>
  /** Verifica se um módulo está habilitado */
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
 * Retorna true se o módulo está ativo, false caso contrário.
 */
export function useModuleEnabled(moduleId: string): boolean {
  const { isEnabled } = useContext(ModuleContext)
  return isEnabled(moduleId)
}

/**
 * Hook que retorna o set completo de módulos habilitados.
 */
export function useEnabledModules(): Set<string> {
  const { enabledModules } = useContext(ModuleContext)
  return enabledModules
}
