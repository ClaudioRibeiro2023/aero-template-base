import { defineManifest } from '@template/modules'

/**
 * TEMPLATE MÍNIMO DE MANIFEST
 * Copie e adapte para criar um novo módulo.
 * Substitua "template" pelo id do seu módulo (kebab-case).
 */
export default defineManifest({
  id: 'template',
  name: 'Meu Módulo',
  description: 'Descrição curta do que este módulo faz',
  version: '1.0.0',
  category: 'optional',
  enabled: false,
  order: 10,
  dependencies: ['auth'],
  routes: ['/template'],
  apiRoutes: ['/api/template'],
  requiredTables: [],
  envVars: [],
  featureFlags: ['module.template'],
  hooks: [],
  components: [],
  icon: 'Box',
  path: '/template',
  roles: [],
  showInSidebar: true,
  group: 'Principal',
  functions: [
    {
      id: 'template-main',
      moduleId: 'template',
      name: 'Visão Geral',
      subtitle: 'Página principal do módulo',
      path: '/template',
      category: 'OPERACIONAL',
      enabled: true,
      order: 0,
      roles: [],
      tags: ['template'],
    },
  ],
})
