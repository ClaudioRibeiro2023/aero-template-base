import { NAVIGATION } from './map'
import type { AppModule, NavigationMap } from './types'

/**
 * Encontra um módulo pelo ID
 */
export function findModuleById(id: string, nav: NavigationMap = NAVIGATION): AppModule | undefined {
  return nav.modules.find(m => m.id === id)
}

/**
 * Encontra um módulo pelo path
 */
export function findModuleByPath(
  path: string,
  nav: NavigationMap = NAVIGATION
): AppModule | undefined {
  return nav.modules.find(m => {
    if (m.path === path) return true
    if (m.functions?.some(f => f.path === path)) return true
    return false
  })
}

/**
 * Agrupa módulos por grupo
 */
export function getModulesByGroup(nav: NavigationMap = NAVIGATION): Record<string, AppModule[]> {
  const groups: Record<string, AppModule[]> = {}

  nav.modules.forEach(module => {
    const group = module.group || 'Outros'
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(module)
  })

  return groups
}

/**
 * Filtra módulos por roles do usuário
 */
export function filterModulesByRoles(
  roles: string[],
  nav: NavigationMap = NAVIGATION
): AppModule[] {
  return nav.modules.filter(module => {
    if (!module.roles || module.roles.length === 0) return true
    return module.roles.some(role => roles.includes(role))
  })
}

/**
 * Obtém módulos para o menu principal (topNav)
 */
export function getTopNavModules(nav: NavigationMap = NAVIGATION): AppModule[] {
  return nav.modules.filter(m => m.topNav)
}
