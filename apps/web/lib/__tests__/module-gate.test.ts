/**
 * Module Gate Tests — Sprint 8
 *
 * Testa as funções de gating que controlam acesso a rotas/módulos.
 * Mocka os exports de @/config/modules para isolar os testes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ModuleManifest } from '@template/modules'

// ═══════════════════════════════════════════════════════════════
// MOCK — @/config/modules
// ═══════════════════════════════════════════════════════════════

const mockEnabledIds = new Set<string>()
const mockManifests: ModuleManifest[] = []

vi.mock('@/config/modules', () => ({
  get enabledModuleIds() {
    return mockEnabledIds
  },
  get allManifests() {
    return mockManifests
  },
}))

// Import AFTER mock setup
import {
  isModuleEnabled,
  isRouteEnabled,
  isApiRouteEnabled,
  getModuleForRoute,
  getModuleForApiRoute,
} from '../module-gate'

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function createManifest(partial: Partial<ModuleManifest> & { id: string }): ModuleManifest {
  return {
    name: partial.name ?? partial.id,
    description: partial.description ?? '',
    version: partial.version ?? '1.0.0',
    category: partial.category ?? 'default',
    enabled: partial.enabled ?? true,
    order: partial.order ?? 0,
    dependencies: partial.dependencies ?? [],
    routes: partial.routes ?? [],
    apiRoutes: partial.apiRoutes ?? [],
    requiredTables: partial.requiredTables ?? [],
    envVars: partial.envVars ?? [],
    featureFlags: partial.featureFlags ?? [],
    hooks: partial.hooks ?? [],
    components: partial.components ?? [],
    icon: partial.icon ?? 'Box',
    path: partial.path ?? `/${partial.id}`,
    roles: partial.roles ?? [],
    showInSidebar: partial.showInSidebar ?? true,
    group: partial.group ?? 'Default',
    functions: partial.functions ?? [],
    ...partial,
  }
}

function setupModules(
  configs: Array<{
    id: string
    category: ModuleManifest['category']
    enabled: boolean
    routes?: string[]
    apiRoutes?: string[]
  }>
) {
  mockEnabledIds.clear()
  mockManifests.length = 0

  for (const cfg of configs) {
    const manifest = createManifest({
      id: cfg.id,
      category: cfg.category,
      enabled: cfg.enabled,
      routes: cfg.routes ?? [],
      apiRoutes: cfg.apiRoutes ?? [],
    })
    mockManifests.push(manifest)
    if (cfg.enabled) {
      mockEnabledIds.add(cfg.id)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

describe('module-gate', () => {
  beforeEach(() => {
    mockEnabledIds.clear()
    mockManifests.length = 0
  })

  // ── 1. Core module routes always accessible ────────────────

  describe('core module routes', () => {
    it('core module routes are always accessible', () => {
      setupModules([
        { id: 'auth', category: 'core', enabled: true, routes: ['/login', '/register'] },
        { id: 'admin', category: 'core', enabled: true, routes: ['/admin'] },
      ])

      // Core/utility modules are skipped by getModuleForRoute, so their routes
      // return null (no gating) which means isRouteEnabled returns true
      expect(isRouteEnabled('/login')).toBe(true)
      expect(isRouteEnabled('/register')).toBe(true)
      expect(isRouteEnabled('/admin')).toBe(true)
    })

    it('core modules are skipped in route lookup (no gating needed)', () => {
      setupModules([{ id: 'auth', category: 'core', enabled: true, routes: ['/login'] }])

      // getModuleForRoute skips core, returns null
      expect(getModuleForRoute('/login')).toBeNull()
    })
  })

  // ── 2. Enabled module route returns true ───────────────────

  describe('enabled modules', () => {
    it('enabled module route returns true', () => {
      setupModules([
        { id: 'dashboard', category: 'default', enabled: true, routes: ['/dashboard'] },
        { id: 'tasks', category: 'default', enabled: true, routes: ['/tasks'] },
      ])

      expect(isRouteEnabled('/dashboard')).toBe(true)
      expect(isRouteEnabled('/tasks')).toBe(true)
    })

    it('isModuleEnabled returns true for enabled module', () => {
      setupModules([{ id: 'dashboard', category: 'default', enabled: true }])

      expect(isModuleEnabled('dashboard')).toBe(true)
    })
  })

  // ── 3. Disabled module route returns false ─────────────────

  describe('disabled modules', () => {
    it('disabled module route returns false', () => {
      setupModules([
        {
          id: 'support',
          category: 'optional',
          enabled: false,
          routes: ['/support', '/support/tickets'],
        },
      ])

      expect(isRouteEnabled('/support')).toBe(false)
      expect(isRouteEnabled('/support/tickets')).toBe(false)
    })

    it('isModuleEnabled returns false for disabled module', () => {
      setupModules([{ id: 'support', category: 'optional', enabled: false }])

      expect(isModuleEnabled('support')).toBe(false)
    })
  })

  // ── 4. Unknown route returns true (allowed by default) ─────

  describe('unknown routes', () => {
    it('unknown route returns true (allowed by default)', () => {
      setupModules([
        { id: 'dashboard', category: 'default', enabled: true, routes: ['/dashboard'] },
      ])

      // Route not controlled by any module
      expect(isRouteEnabled('/some-random-page')).toBe(true)
      expect(isRouteEnabled('/about')).toBe(true)
    })

    it('getModuleForRoute returns null for unknown route', () => {
      setupModules([
        { id: 'dashboard', category: 'default', enabled: true, routes: ['/dashboard'] },
      ])

      expect(getModuleForRoute('/unknown-route')).toBeNull()
    })
  })

  // ── 5. API route gating works correctly ────────────────────

  describe('API route gating', () => {
    it('enabled module API route returns true', () => {
      setupModules([{ id: 'tasks', category: 'default', enabled: true, apiRoutes: ['/api/tasks'] }])

      expect(isApiRouteEnabled('/api/tasks')).toBe(true)
    })

    it('disabled module API route returns false', () => {
      setupModules([
        { id: 'support', category: 'optional', enabled: false, apiRoutes: ['/api/support'] },
      ])

      expect(isApiRouteEnabled('/api/support')).toBe(false)
    })

    it('unknown API route returns true by default', () => {
      setupModules([{ id: 'tasks', category: 'default', enabled: true, apiRoutes: ['/api/tasks'] }])

      expect(isApiRouteEnabled('/api/health')).toBe(true)
    })

    it('getModuleForApiRoute identifies correct module', () => {
      setupModules([
        { id: 'tasks', category: 'default', enabled: true, apiRoutes: ['/api/tasks'] },
        { id: 'support', category: 'optional', enabled: false, apiRoutes: ['/api/support'] },
      ])

      expect(getModuleForApiRoute('/api/tasks')).toBe('tasks')
      expect(getModuleForApiRoute('/api/support')).toBe('support')
      expect(getModuleForApiRoute('/api/unknown')).toBeNull()
    })

    it('core API routes are not gated', () => {
      setupModules([{ id: 'auth', category: 'core', enabled: true, apiRoutes: ['/api/auth'] }])

      // Core modules skipped in lookup
      expect(getModuleForApiRoute('/api/auth')).toBeNull()
      expect(isApiRouteEnabled('/api/auth')).toBe(true)
    })
  })

  // ── 6. Nested routes match parent module ───────────────────

  describe('nested route matching', () => {
    it('nested routes match parent module via prefix', () => {
      setupModules([
        { id: 'support', category: 'optional', enabled: false, routes: ['/support/tickets'] },
      ])

      // /support/tickets/123 starts with /support/tickets + '/'
      expect(isRouteEnabled('/support/tickets/123')).toBe(false)
      expect(isRouteEnabled('/support/tickets/new')).toBe(false)
      expect(getModuleForRoute('/support/tickets/123')).toBe('support')
    })

    it('nested API routes match parent module', () => {
      setupModules([{ id: 'tasks', category: 'default', enabled: true, apiRoutes: ['/api/tasks'] }])

      expect(isApiRouteEnabled('/api/tasks/123')).toBe(true)
      expect(getModuleForApiRoute('/api/tasks/123/comments')).toBe('tasks')
    })

    it('exact route match works', () => {
      setupModules([
        { id: 'dashboard', category: 'default', enabled: true, routes: ['/dashboard'] },
      ])

      expect(getModuleForRoute('/dashboard')).toBe('dashboard')
      expect(isRouteEnabled('/dashboard')).toBe(true)
    })

    it('similar but non-matching prefix does not match', () => {
      setupModules([{ id: 'support', category: 'optional', enabled: false, routes: ['/support'] }])

      // /support-legacy does NOT start with /support + '/'
      // and is NOT exact match /support
      expect(getModuleForRoute('/support-legacy')).toBeNull()
      expect(isRouteEnabled('/support-legacy')).toBe(true)
    })
  })

  // ── Utility modules ────────────────────────────────────────

  describe('utility modules', () => {
    it('utility module routes are not gated (same as core)', () => {
      setupModules([{ id: 'file-upload', category: 'utility', enabled: true, routes: ['/upload'] }])

      // Utility is skipped like core in getModuleForRoute
      expect(getModuleForRoute('/upload')).toBeNull()
      expect(isRouteEnabled('/upload')).toBe(true)
    })
  })
})
