import { defineManifest } from '@template/modules'

export default defineManifest({
  id: 'exemplo',
  name: 'Exemplo',
  description:
    'CRUD completo de referência com hooks, services e tipos — use como base para novos módulos',
  version: '1.0.0',
  category: 'optional',
  enabled: false,
  order: 99,
  dependencies: ['auth'],
  routes: ['/exemplo'],
  apiRoutes: ['/api/exemplo'],
  requiredTables: [],
  envVars: [],
  featureFlags: ['module.exemplo'],
  hooks: ['useExampleData'],
  components: ['ExampleCard'],
  icon: 'Code',
  path: '/exemplo',
  roles: [],
  showInSidebar: false,
  group: 'Dev',
  functions: [
    {
      id: 'exemplo-main',
      moduleId: 'exemplo',
      name: 'Exemplo',
      subtitle: 'Módulo de referência',
      path: '/exemplo',
      category: 'DEV',
      enabled: true,
      order: 0,
      roles: [],
      tags: ['exemplo', 'referencia', 'crud'],
    },
  ],
})
