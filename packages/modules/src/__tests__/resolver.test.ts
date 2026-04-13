/**
 * @template/modules — Resolver Tests (Sprint 8)
 *
 * Testes abrangentes do resolveModules():
 * - Core immunity, default/optional behavior
 * - Dependency validation, circular detection
 * - Route/API route sets
 * - Topological ordering
 */

import { describe, it, expect } from 'vitest'
import { resolveModules } from '../resolver'
import type { ModuleManifest } from '../manifest'
import type { ModuleOverride } from '../resolver'

// ═══════════════════════════════════════════════════════════════
// HELPERS — factory para criar manifests de teste
// ═══════════════════════════════════════════════════════════════

function createManifest(partial: Partial<ModuleManifest> & { id: string }): ModuleManifest {
  return {
    name: partial.name ?? partial.id,
    description: partial.description ?? `Modulo ${partial.id}`,
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

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

describe('resolveModules', () => {
  // ── 1. Core modules always enabled ─────────────────────────

  it('core modules are always enabled regardless of overrides', () => {
    const manifests = [
      createManifest({ id: 'auth', category: 'core', order: 0 }),
      createManifest({ id: 'admin', category: 'core', order: 1 }),
    ]

    const overrides: Record<string, ModuleOverride> = {
      auth: { enabled: false },
      admin: { enabled: false },
    }

    const result = resolveModules(manifests, overrides)

    expect(result.enabled).toHaveLength(2)
    expect(result.enabledIds.has('auth')).toBe(true)
    expect(result.enabledIds.has('admin')).toBe(true)
    expect(result.disabled).toHaveLength(0)
    expect(result.warnings).toHaveLength(2)
    expect(result.warnings[0]).toContain('core')
    expect(result.warnings[0]).toContain('nao pode ser desabilitado')
  })

  // ── 2. Default modules enabled by default ──────────────────

  it('default modules are enabled by default without overrides', () => {
    const manifests = [
      createManifest({ id: 'auth', category: 'core', order: 0 }),
      createManifest({ id: 'dashboard', category: 'default', order: 1 }),
      createManifest({ id: 'reports', category: 'default', order: 2 }),
    ]

    const result = resolveModules(manifests)

    expect(result.enabled).toHaveLength(3)
    expect(result.enabledIds.has('dashboard')).toBe(true)
    expect(result.enabledIds.has('reports')).toBe(true)
  })

  // ── 3. Optional modules respect overrides ──────────────────

  it('optional modules respect enabled override', () => {
    const manifests = [
      createManifest({ id: 'auth', category: 'core', order: 0 }),
      createManifest({ id: 'support', category: 'optional', enabled: false, order: 10 }),
      createManifest({ id: 'organizations', category: 'optional', enabled: false, order: 11 }),
    ]

    const overrides: Record<string, ModuleOverride> = {
      support: { enabled: true },
      // organizations stays disabled (no override)
    }

    const result = resolveModules(manifests, overrides)

    expect(result.enabledIds.has('support')).toBe(true)
    expect(result.enabledIds.has('organizations')).toBe(false)
    expect(result.disabled.find(m => m.id === 'organizations')).toBeDefined()
  })

  // ── 4. Disabling a dependency reports error ────────────────

  it('disabling a dependency causes error for dependents', () => {
    const manifests = [
      createManifest({ id: 'auth', category: 'core', order: 0 }),
      createManifest({ id: 'notifications', category: 'default', order: 5 }),
      createManifest({
        id: 'support',
        category: 'default',
        order: 10,
        dependencies: ['auth', 'notifications'],
      }),
    ]

    const overrides: Record<string, ModuleOverride> = {
      notifications: { enabled: false },
    }

    const result = resolveModules(manifests, overrides)

    expect(result.errors.length).toBeGreaterThan(0)
    expect(
      result.errors.some(
        e => e.includes('support') && e.includes('notifications') && e.includes('desabilitado')
      )
    ).toBe(true)
  })

  // ── 5. Circular dependency detection ───────────────────────

  it('detects circular dependencies', () => {
    const manifests = [
      createManifest({ id: 'a', order: 0, dependencies: ['b'] }),
      createManifest({ id: 'b', order: 1, dependencies: ['c'] }),
      createManifest({ id: 'c', order: 2, dependencies: ['a'] }),
    ]

    const result = resolveModules(manifests)

    expect(
      result.errors.some(e => e.includes('circular') || e.includes('Dependencia circular'))
    ).toBe(true)
  })

  // ── 6. Unknown module override is ignored ──────────────────

  it('unknown module override is ignored without error', () => {
    const manifests = [createManifest({ id: 'auth', category: 'core', order: 0 })]

    const overrides: Record<string, ModuleOverride> = {
      'non-existent-module': { enabled: true },
    }

    const result = resolveModules(manifests, overrides)

    // Should not crash, no errors about unknown module
    expect(result.enabled).toHaveLength(1)
    expect(result.errors).toHaveLength(0)
  })

  // ── 7. Empty manifests produces empty result ───────────────

  it('empty manifests produces empty result', () => {
    const result = resolveModules([])

    expect(result.enabled).toHaveLength(0)
    expect(result.disabled).toHaveLength(0)
    expect(result.all).toHaveLength(0)
    expect(result.enabledIds.size).toBe(0)
    expect(result.enabledRoutes.size).toBe(0)
    expect(result.enabledApiRoutes.size).toBe(0)
    expect(result.errors).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })

  // ── 8. Route sets are built correctly ──────────────────────

  it('route sets are built correctly from enabled modules', () => {
    const manifests = [
      createManifest({
        id: 'auth',
        category: 'core',
        order: 0,
        routes: ['/login', '/register', '/forgot-password'],
      }),
      createManifest({
        id: 'dashboard',
        category: 'default',
        order: 1,
        routes: ['/dashboard'],
      }),
      createManifest({
        id: 'support',
        category: 'optional',
        enabled: false,
        order: 10,
        routes: ['/support', '/support/tickets'],
      }),
    ]

    const result = resolveModules(manifests)

    // Enabled routes: auth + dashboard
    expect(result.enabledRoutes.has('/login')).toBe(true)
    expect(result.enabledRoutes.has('/register')).toBe(true)
    expect(result.enabledRoutes.has('/forgot-password')).toBe(true)
    expect(result.enabledRoutes.has('/dashboard')).toBe(true)

    // Disabled module routes should NOT be in enabledRoutes
    expect(result.enabledRoutes.has('/support')).toBe(false)
    expect(result.enabledRoutes.has('/support/tickets')).toBe(false)
  })

  // ── 9. API route sets are built correctly ──────────────────

  it('API route sets are built correctly from enabled modules', () => {
    const manifests = [
      createManifest({
        id: 'auth',
        category: 'core',
        order: 0,
        apiRoutes: ['/api/auth'],
      }),
      createManifest({
        id: 'tasks',
        category: 'default',
        order: 5,
        apiRoutes: ['/api/tasks'],
      }),
      createManifest({
        id: 'support',
        category: 'optional',
        enabled: false,
        order: 10,
        apiRoutes: ['/api/support'],
      }),
    ]

    const result = resolveModules(manifests)

    expect(result.enabledApiRoutes.has('/api/auth')).toBe(true)
    expect(result.enabledApiRoutes.has('/api/tasks')).toBe(true)
    expect(result.enabledApiRoutes.has('/api/support')).toBe(false)
  })

  // ── 10. Multiple dependencies resolved in correct order ────

  it('multiple dependencies resolved in topological order', () => {
    const manifests = [
      createManifest({ id: 'feature-flags', order: 3, dependencies: ['auth', 'admin'] }),
      createManifest({ id: 'admin', category: 'core', order: 1, dependencies: ['auth'] }),
      createManifest({ id: 'auth', category: 'core', order: 0, dependencies: [] }),
      createManifest({ id: 'dashboard', order: 2, dependencies: ['auth'] }),
    ]

    const result = resolveModules(manifests)

    expect(result.errors).toHaveLength(0)

    // All should be in the 'all' list
    expect(result.all).toHaveLength(4)

    // In the `all` array (topologically sorted), auth should come before admin,
    // and both before feature-flags
    const allIds = result.all.map(m => m.id)
    const authIdx = allIds.indexOf('auth')
    const adminIdx = allIds.indexOf('admin')
    const ffIdx = allIds.indexOf('feature-flags')

    expect(authIdx).toBeLessThan(adminIdx)
    expect(adminIdx).toBeLessThan(ffIdx)
  })

  // ── Extras: edge cases ─────────────────────────────────────

  it('reports error for dependency on non-existent module', () => {
    const manifests = [createManifest({ id: 'tasks', order: 0, dependencies: ['ghost-module'] })]

    const result = resolveModules(manifests)

    expect(result.errors.some(e => e.includes('ghost-module') && e.includes('nao existe'))).toBe(
      true
    )
  })

  it('reports duplicate module IDs', () => {
    const manifests = [
      createManifest({ id: 'auth', category: 'core', order: 0 }),
      createManifest({ id: 'auth', category: 'core', order: 1 }),
    ]

    const result = resolveModules(manifests)

    expect(result.errors.some(e => e.includes('auth') && e.includes('mais de uma vez'))).toBe(true)
  })

  it('disabled modules appear in disabled array', () => {
    const manifests = [
      createManifest({ id: 'auth', category: 'core', order: 0 }),
      createManifest({ id: 'reports', category: 'default', order: 5 }),
    ]

    const overrides: Record<string, ModuleOverride> = {
      reports: { enabled: false },
    }

    const result = resolveModules(manifests, overrides)

    expect(result.disabled).toHaveLength(1)
    expect(result.disabled[0].id).toBe('reports')
    expect(result.enabled).toHaveLength(1)
    expect(result.enabled[0].id).toBe('auth')
  })
})
