/**
 * @template/modules — Dependency Resolver
 *
 * Resolve módulos considerando dependências, categorias e overrides.
 * Valida grafo de dependências e detecta ciclos.
 */

import type { ModuleManifest } from './manifest'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface ModuleOverride {
  enabled: boolean
}

export interface ResolvedModuleSet {
  /** Módulos habilitados, ordenados por dependência + order */
  enabled: ModuleManifest[]
  /** Módulos desabilitados */
  disabled: ModuleManifest[]
  /** Todos os módulos (enabled + disabled) */
  all: ModuleManifest[]
  /** Set de IDs habilitados (lookup rápido) */
  enabledIds: Set<string>
  /** Set de rotas habilitadas (lookup rápido para middleware) */
  enabledRoutes: Set<string>
  /** Set de prefixos de API habilitados */
  enabledApiRoutes: Set<string>
  /** Erros de validação (dependências faltando, ciclos) */
  errors: string[]
  /** Warnings (não-bloqueantes) */
  warnings: string[]
}

// ═══════════════════════════════════════════════════════════════
// RESOLVER
// ═══════════════════════════════════════════════════════════════

/**
 * Resolve módulos aplicando overrides, validando dependências e produzindo
 * o set final de módulos habilitados/desabilitados.
 */
export function resolveModules(
  manifests: ModuleManifest[],
  overrides: Record<string, ModuleOverride> = {}
): ResolvedModuleSet {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. Aplicar overrides (core nunca pode ser desabilitado)
  const resolved = manifests.map(m => {
    const override = overrides[m.id]
    if (m.category === 'core') {
      if (override && !override.enabled) {
        warnings.push(`Modulo '${m.id}' e core e nao pode ser desabilitado — override ignorado`)
      }
      return { ...m, enabled: true }
    }
    if (override !== undefined) {
      return { ...m, enabled: override.enabled }
    }
    return { ...m }
  })

  // 2. Index por ID para lookup
  const byId = new Map<string, ModuleManifest>()
  for (const m of resolved) {
    if (byId.has(m.id)) {
      errors.push(`Modulo '${m.id}' declarado mais de uma vez`)
    }
    byId.set(m.id, m)
  }

  // 3. Validar dependências
  for (const m of resolved) {
    if (!m.enabled) continue

    for (const depId of m.dependencies) {
      const dep = byId.get(depId)
      if (!dep) {
        errors.push(`Modulo '${m.id}' depende de '${depId}' que nao existe`)
      } else if (!dep.enabled) {
        errors.push(`Modulo '${m.id}' depende de '${depId}' que esta desabilitado`)
      }
    }
  }

  // 4. Detectar ciclos via DFS
  const visited = new Set<string>()
  const inStack = new Set<string>()

  function hasCycle(id: string, path: string[]): boolean {
    if (inStack.has(id)) {
      const cycle = [...path.slice(path.indexOf(id)), id]
      errors.push(`Dependencia circular detectada: ${cycle.join(' -> ')}`)
      return true
    }
    if (visited.has(id)) return false

    visited.add(id)
    inStack.add(id)

    const m = byId.get(id)
    if (m) {
      for (const depId of m.dependencies) {
        if (hasCycle(depId, [...path, id])) return true
      }
    }

    inStack.delete(id)
    return false
  }

  for (const m of resolved) {
    if (!visited.has(m.id)) {
      hasCycle(m.id, [])
    }
  }

  // 5. Topological sort (dependências primeiro)
  const sorted: ModuleManifest[] = []
  const sortVisited = new Set<string>()

  function topoSort(id: string) {
    if (sortVisited.has(id)) return
    sortVisited.add(id)

    const m = byId.get(id)
    if (!m) return

    for (const depId of m.dependencies) {
      topoSort(depId)
    }

    sorted.push(m)
  }

  // Sort all modules
  for (const m of resolved) {
    topoSort(m.id)
  }

  // 6. Separar enabled/disabled e construir sets
  const enabled = sorted.filter(m => m.enabled).sort((a, b) => a.order - b.order)
  const disabled = sorted.filter(m => !m.enabled).sort((a, b) => a.order - b.order)

  const enabledIds = new Set(enabled.map(m => m.id))

  const enabledRoutes = new Set<string>()
  const enabledApiRoutes = new Set<string>()

  for (const m of enabled) {
    for (const route of m.routes) {
      enabledRoutes.add(route)
    }
    for (const apiRoute of m.apiRoutes) {
      enabledApiRoutes.add(apiRoute)
    }
  }

  return {
    enabled,
    disabled,
    all: sorted,
    enabledIds,
    enabledRoutes,
    enabledApiRoutes,
    errors,
    warnings,
  }
}
