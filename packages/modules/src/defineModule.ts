import type { ModuleDefinition, ModuleRegistry } from './registry'

/**
 * Helper tipado para registrar um módulo em um registry.
 *
 * Uso:
 * ```ts
 * import { defineModule } from '@template/modules'
 * import { moduleRegistry } from '@/lib/module-registry'
 *
 * export const tasksModule = defineModule(moduleRegistry, {
 *   id: 'tasks',
 *   name: 'Tarefas',
 *   enabled: true,
 *   order: 30,
 *   // ... campos específicos de ModuleConfig
 * })
 * ```
 */
export function defineModule<T extends ModuleDefinition>(
  registry: ModuleRegistry<T>,
  definition: T
): T {
  registry.register(definition)
  return definition
}
