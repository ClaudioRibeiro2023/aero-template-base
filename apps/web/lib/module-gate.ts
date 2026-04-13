/**
 * Module Gating — verifica se rotas/módulos estão habilitados.
 *
 * Funções puras que consultam o set estático de módulos resolvidos.
 * Usado pelo middleware (server-side) e por componentes (client-side).
 */

import { enabledModuleIds, allManifests } from '@/config/modules'

/**
 * Verifica se um módulo está habilitado pelo ID.
 */
export function isModuleEnabled(moduleId: string): boolean {
  return enabledModuleIds.has(moduleId)
}

/**
 * Encontra qual módulo controla uma rota de página.
 * Retorna o ID do módulo ou null se nenhum controla (rota pública/core).
 */
export function getModuleForRoute(pathname: string): string | null {
  for (const manifest of allManifests) {
    // Core modules não precisam de gating
    if (manifest.category === 'core' || manifest.category === 'utility') continue

    for (const route of manifest.routes) {
      // Match exato ou prefixo (ex: /support/tickets/[id] matcha /support/tickets)
      if (pathname === route || pathname.startsWith(route + '/')) {
        return manifest.id
      }
    }
  }
  return null
}

/**
 * Encontra qual módulo controla uma rota de API.
 * Retorna o ID do módulo ou null.
 */
export function getModuleForApiRoute(pathname: string): string | null {
  for (const manifest of allManifests) {
    if (manifest.category === 'core' || manifest.category === 'utility') continue

    for (const apiRoute of manifest.apiRoutes) {
      if (pathname === apiRoute || pathname.startsWith(apiRoute + '/')) {
        return manifest.id
      }
    }
  }
  return null
}

/**
 * Verifica se uma rota de página está habilitada.
 * Rotas não controladas por nenhum módulo são permitidas por padrão.
 */
export function isRouteEnabled(pathname: string): boolean {
  const moduleId = getModuleForRoute(pathname)
  if (moduleId === null) return true // rota não controlada por módulo → permitida
  return enabledModuleIds.has(moduleId)
}

/**
 * Verifica se uma rota de API está habilitada.
 * Rotas não controladas por nenhum módulo são permitidas por padrão.
 */
export function isApiRouteEnabled(pathname: string): boolean {
  const moduleId = getModuleForApiRoute(pathname)
  if (moduleId === null) return true
  return enabledModuleIds.has(moduleId)
}
