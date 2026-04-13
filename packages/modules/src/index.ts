/**
 * @template/modules — Registro agnóstico de módulos de navegação.
 *
 * Uso básico:
 * ```ts
 * import { ModuleRegistry, createRegistry, defineModule } from '@template/modules'
 *
 * const registry = createRegistry<MinhaConfig>()
 * defineModule(registry, { id: 'dashboard', enabled: true, order: 0, ... })
 * registry.getEnabled() // módulos habilitados, ordenados
 * ```
 */
export { ModuleRegistry, createRegistry } from './registry'
export type { ModuleDefinition, ModuleRegistryOptions } from './registry'
export { defineModule } from './defineModule'
export { defineManifest } from './manifest'
export type { ModuleManifest, ModuleCategory, ModuleEnvVar, ModuleFunctionDef } from './manifest'
export { resolveModules } from './resolver'
export type { ModuleOverride, ResolvedModuleSet } from './resolver'
