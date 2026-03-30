import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Início Rápido',
      items: ['getting-started', 'project-structure', 'configuration'],
    },
    {
      type: 'category',
      label: 'Arquitetura',
      items: ['architecture', 'multi-tenancy', 'authentication', 'security'],
    },
    {
      type: 'category',
      label: 'Frontend',
      items: ['frontend/overview', 'frontend/components', 'frontend/hooks', 'frontend/state-management', 'frontend/i18n', 'frontend/pwa'],
    },
    {
      type: 'category',
      label: 'Backend',
      items: ['backend/overview', 'backend/routers', 'backend/models', 'backend/cache', 'backend/observability'],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: ['api/tasks', 'api/users', 'api/files', 'api/admin-config', 'api/feature-flags'],
    },
    {
      type: 'category',
      label: 'Guias',
      items: ['guides/new-module', 'guides/testing', 'guides/deployment', 'guides/contributing'],
    },
  ],
}

export default sidebars
