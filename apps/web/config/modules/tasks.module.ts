/**
 * Módulo Tarefas — definição isolada via defineModule().
 *
 * Este arquivo demonstra o padrão v3.0: cada módulo em seu próprio arquivo,
 * independente de navigation-default.ts.
 */

import { defineModule } from '@template/modules'
import { moduleRegistry } from '@/lib/module-registry'

export const tasksModule = defineModule(moduleRegistry, {
  id: 'tasks',
  name: 'Tarefas',
  description: 'Gerenciar tarefas do projeto',
  icon: 'CheckCircle' as const,
  path: '/tasks',
  enabled: true,
  order: 3,
  roles: [],
  showInSidebar: true,
  showInFunctionsPanel: true,
  group: 'Principal',
  functions: [
    {
      id: 'tasks-list',
      moduleId: 'tasks',
      name: 'Todas as Tarefas',
      subtitle: 'Listar, criar e gerenciar',
      path: '/tasks',
      category: 'OPERACIONAL' as const,
      enabled: true,
      order: 0,
      roles: [],
      tags: ['tasks', 'crud'],
    },
  ],
})
