import type { UserRole, NavigationMap } from './types'

/**
 * Mapa de Navegação do Template
 *
 * Estrutura genérica baseada no SIVEPI para adaptação.
 * Customize os módulos, funções e roles conforme necessidade.
 */
export const NAVIGATION: NavigationMap = {
  modules: [
    // =========================================================================
    // DASHBOARD & PAINÉIS
    // =========================================================================
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Painel principal com KPIs e visão geral',
      path: '/dashboard',
      topNav: true,
      icon: 'LayoutDashboard',
      group: 'Principal',
      functions: [
        {
          id: 'dashboard-main',
          name: 'Visão Geral',
          subtitle: 'KPIs e métricas principais',
          path: '/dashboard',
          category: 'INDICADORES',
          icon: 'LayoutGrid',
        },
        {
          id: 'dashboard-analytics',
          name: 'Analytics',
          subtitle: 'Análises detalhadas',
          path: '/dashboard/analytics',
          category: 'ANALISE',
          icon: 'TrendingUp',
        },
        {
          id: 'dashboard-alerts',
          name: 'Alertas',
          subtitle: 'Notificações e watchlist',
          path: '/dashboard/alerts',
          category: 'CONTROLE',
          icon: 'Bell',
        },
      ],
    },

    // =========================================================================
    // RELATÓRIOS
    // =========================================================================
    {
      id: 'relatorios',
      name: 'Relatórios',
      description: 'Relatórios e exportações',
      path: '/relatorios',
      topNav: true,
      icon: 'BarChart3',
      group: 'Principal',
      functions: [
        {
          id: 'relatorios-gerenciais',
          name: 'Gerenciais',
          subtitle: 'Relatórios de gestão',
          path: '/relatorios',
          category: 'INDICADORES',
          icon: 'FileSpreadsheet',
        },
        {
          id: 'relatorios-operacionais',
          name: 'Operacionais',
          subtitle: 'Relatórios de operação',
          path: '/relatorios/operacionais',
          category: 'OPERACIONAL',
          icon: 'ClipboardList',
        },
        {
          id: 'exportacoes',
          name: 'Exportações',
          subtitle: 'Download de dados',
          path: '/relatorios/export',
          category: 'OPERACIONAL',
          icon: 'Download',
        },
      ],
    },

    // =========================================================================
    // MÓDULO DE EXEMPLO
    // =========================================================================
    {
      id: 'exemplo',
      name: 'Módulo Exemplo',
      description: 'Exemplo de módulo com submenus',
      path: '/exemplo',
      icon: 'Boxes',
      group: 'Módulos',
      functions: [
        {
          id: 'exemplo-listagem',
          name: 'Listagem',
          subtitle: 'Lista de registros',
          path: '/exemplo',
          category: 'OPERACIONAL',
          icon: 'List',
        },
        {
          id: 'exemplo-cadastro',
          name: 'Cadastro',
          subtitle: 'Novo registro',
          path: '/exemplo/novo',
          category: 'OPERACIONAL',
          icon: 'Plus',
        },
        {
          id: 'exemplo-mapa',
          name: 'Mapa',
          subtitle: 'Visualização espacial',
          path: '/exemplo/mapa',
          category: 'MAPEAMENTO',
          icon: 'Map',
        },
        {
          id: 'exemplo-graficos',
          name: 'Gráficos',
          subtitle: 'Análises visuais',
          path: '/exemplo/graficos',
          category: 'ANALISE',
          icon: 'LineChart',
        },
      ],
    },

    // =========================================================================
    // SERVIÇOS TÉCNICOS
    // =========================================================================
    {
      id: 'etl',
      name: 'ETL & Integração',
      description: 'Importadores, tratamento e catálogo de dados',
      path: '/admin/etl',
      icon: 'Database',
      badge: 'BETA',
      group: 'Serviços Técnicos',
      roles: ['ADMIN'] as UserRole[],
      functions: [
        // Importadores
        {
          id: 'etl-import-csv',
          name: 'Importar CSV',
          subtitle: 'Arquivos CSV e planilhas',
          path: '/admin/etl?src=csv',
          category: 'OPERACIONAL',
          icon: 'Upload',
        },
        {
          id: 'etl-import-json',
          name: 'Importar JSON',
          subtitle: 'Arquivos JSON e APIs',
          path: '/admin/etl?src=json',
          category: 'OPERACIONAL',
          icon: 'Braces',
        },
        {
          id: 'etl-import-shape',
          name: 'Importar Shapefile',
          subtitle: 'Dados geoespaciais',
          path: '/admin/etl?src=shapefile',
          category: 'OPERACIONAL',
          icon: 'Map',
        },
        {
          id: 'etl-import-api',
          name: 'Conectores API',
          subtitle: 'Integrações externas',
          path: '/admin/etl?src=api',
          category: 'OPERACIONAL',
          icon: 'Plug',
        },
        // Tratamento
        {
          id: 'etl-transform',
          name: 'Tratamento/Mapeamento',
          subtitle: 'Transformação de dados',
          path: '/admin/etl/transform',
          category: 'OPERACIONAL',
          icon: 'Workflow',
        },
        {
          id: 'etl-validation',
          name: 'Validação',
          subtitle: 'Regras de validação',
          path: '/admin/etl/validation',
          category: 'CONTROLE',
          icon: 'CheckCircle',
        },
        // Catálogo
        {
          id: 'etl-catalogo',
          name: 'Catálogo de Dados',
          subtitle: 'Metadados e dicionário',
          path: '/admin/etl/catalog',
          category: 'CONTROLE',
          icon: 'BookMarked',
        },
        {
          id: 'etl-lineage',
          name: 'Linhagem de Dados',
          subtitle: 'Origem e transformações',
          path: '/admin/etl/lineage',
          category: 'ANALISE',
          icon: 'GitBranch',
        },
        // Qualidade
        {
          id: 'etl-qualidade',
          name: 'Qualidade',
          subtitle: 'Completude, consistência e outliers',
          path: '/admin/etl/quality',
          category: 'CONTROLE',
          icon: 'Shield',
        },
        {
          id: 'etl-profiling',
          name: 'Data Profiling',
          subtitle: 'Estatísticas e distribuições',
          path: '/admin/etl/profiling',
          category: 'ANALISE',
          icon: 'BarChart',
        },
        // Operacional
        {
          id: 'etl-jobs',
          name: 'Jobs & Agendamentos',
          subtitle: 'Execuções programadas',
          path: '/admin/etl/jobs',
          category: 'OPERACIONAL',
          icon: 'Calendar',
        },
        {
          id: 'etl-logs',
          name: 'Logs & Reprocesso',
          subtitle: 'Histórico e rastreabilidade',
          path: '/admin/etl/logs',
          category: 'CONTROLE',
          icon: 'History',
        },
      ],
    },

    {
      id: 'configuracoes',
      name: 'Configurações',
      description: 'Parâmetros do sistema',
      path: '/admin/config',
      icon: 'Settings',
      group: 'Serviços Técnicos',
      roles: ['ADMIN', 'GESTOR'] as UserRole[],
      functions: [
        {
          id: 'config-geral',
          name: 'Geral',
          subtitle: 'Configurações gerais',
          path: '/admin/config',
          category: 'CONTROLE',
          icon: 'Sliders',
        },
        {
          id: 'config-aparencia',
          name: 'Aparência',
          subtitle: 'Tema e personalização',
          path: '/admin/config/aparencia',
          category: 'CONTROLE',
          icon: 'Palette',
        },
        {
          id: 'config-notificacoes',
          name: 'Notificações',
          subtitle: 'Alertas e emails',
          path: '/admin/config/notificacoes',
          category: 'CONTROLE',
          icon: 'Bell',
        },
        {
          id: 'config-integracao',
          name: 'Integrações',
          subtitle: 'APIs e webhooks',
          path: '/admin/config/integracoes',
          category: 'CONTROLE',
          icon: 'Plug',
        },
      ],
    },

    {
      id: 'observabilidade',
      name: 'Observabilidade',
      description: 'Métricas, logs e qualidade operacional',
      path: '/admin/observability',
      icon: 'Gauge',
      badge: 'DEV',
      group: 'Serviços Técnicos',
      roles: ['ADMIN'] as UserRole[],
      functions: [
        {
          id: 'obs-metricas',
          name: 'Métricas',
          subtitle: 'Prometheus/metrics de API e jobs',
          path: '/admin/observability/metrics',
          category: 'CONTROLE',
          icon: 'Activity',
        },
        {
          id: 'obs-logs',
          name: 'Logs',
          subtitle: 'Estruturados e correlação por request-id',
          path: '/admin/observability/logs',
          category: 'CONTROLE',
          icon: 'FileText',
        },
        {
          id: 'obs-health',
          name: 'Saúde',
          subtitle: 'Health checks, filas e storage',
          path: '/admin/observability/health',
          category: 'CONTROLE',
          icon: 'HeartPulse',
        },
        {
          id: 'obs-quality',
          name: 'Qualidade de Dados',
          subtitle: 'Checks recorrentes e painéis',
          path: '/admin/observability/data-quality',
          category: 'CONTROLE',
          icon: 'ShieldCheck',
        },
        {
          id: 'obs-traces',
          name: 'Traces',
          subtitle: 'Rastreamento distribuído',
          path: '/admin/observability/traces',
          category: 'ANALISE',
          icon: 'GitBranch',
        },
        {
          id: 'obs-alerts',
          name: 'Alertas',
          subtitle: 'Configuração de alertas',
          path: '/admin/observability/alerts',
          category: 'CONTROLE',
          icon: 'AlertTriangle',
        },
      ],
    },

    {
      id: 'qualidade',
      name: 'Qualidade',
      description: 'Diagnóstico de qualidade da plataforma',
      path: '/admin/quality',
      icon: 'ShieldCheck',
      group: 'Serviços Técnicos',
      roles: ['ADMIN'] as UserRole[],
      functions: [
        {
          id: 'quality-dashboard',
          name: 'Dashboard',
          subtitle: 'Visão geral de qualidade',
          path: '/admin/quality',
          category: 'CONTROLE',
          icon: 'Gauge',
        },
        {
          id: 'quality-history',
          name: 'Histórico',
          subtitle: 'Relatórios anteriores',
          path: '/admin/quality/history',
          category: 'ANALISE',
          icon: 'History',
        },
      ],
    },

    // =========================================================================
    // DOCUMENTAÇÃO
    // =========================================================================
    {
      id: 'documentacao',
      name: 'Documentação',
      description: 'Guias, tutoriais e referências',
      path: '/docs',
      icon: 'BookOpen',
      group: 'Sistema',
      functions: [
        {
          id: 'docs-inicio',
          name: 'Início Rápido',
          subtitle: 'Primeiros passos',
          path: '/docs',
          category: 'INDICADORES',
          icon: 'Rocket',
        },
        {
          id: 'docs-guias',
          name: 'Guias',
          subtitle: 'Tutoriais detalhados',
          path: '/docs/guias',
          category: 'INDICADORES',
          icon: 'FileText',
        },
        {
          id: 'docs-api',
          name: 'API Reference',
          subtitle: 'Documentação da API',
          path: '/docs/api',
          category: 'CONTROLE',
          icon: 'Code',
        },
        {
          id: 'docs-arquitetura',
          name: 'Arquitetura',
          subtitle: 'Decisões técnicas (ADRs)',
          path: '/docs/arquitetura',
          category: 'ANALISE',
          icon: 'Layers',
        },
        {
          id: 'docs-changelog',
          name: 'Changelog',
          subtitle: 'Histórico de versões',
          path: '/docs/changelog',
          category: 'INDICADORES',
          icon: 'History',
        },
        {
          id: 'docs-faq',
          name: 'FAQ',
          subtitle: 'Perguntas frequentes',
          path: '/docs/faq',
          category: 'INDICADORES',
          icon: 'HelpCircle',
        },
      ],
    },

    // =========================================================================
    // LGPD & COMPLIANCE
    // =========================================================================
    {
      id: 'lgpd',
      name: 'LGPD & Privacidade',
      description: 'Compliance e proteção de dados',
      path: '/lgpd',
      icon: 'ShieldCheck',
      group: 'Sistema',
      functions: [
        {
          id: 'lgpd-politica',
          name: 'Política de Privacidade',
          subtitle: 'Termos e condições',
          path: '/lgpd',
          category: 'INDICADORES',
          icon: 'FileText',
        },
        {
          id: 'lgpd-consentimento',
          name: 'Consentimento',
          subtitle: 'Gerenciar permissões',
          path: '/lgpd/consentimento',
          category: 'CONTROLE',
          icon: 'CheckSquare',
        },
        {
          id: 'lgpd-dados',
          name: 'Meus Dados',
          subtitle: 'Exportar/excluir dados pessoais',
          path: '/lgpd/meus-dados',
          category: 'OPERACIONAL',
          icon: 'User',
        },
        {
          id: 'lgpd-cookies',
          name: 'Cookies',
          subtitle: 'Preferências de cookies',
          path: '/lgpd/cookies',
          category: 'CONTROLE',
          icon: 'Cookie',
        },
        {
          id: 'lgpd-solicitacoes',
          name: 'Solicitações',
          subtitle: 'Requisições de titulares',
          path: '/lgpd/solicitacoes',
          category: 'OPERACIONAL',
          icon: 'Send',
          roles: ['ADMIN'],
        },
        {
          id: 'lgpd-auditoria',
          name: 'Auditoria LGPD',
          subtitle: 'Logs de consentimento',
          path: '/lgpd/auditoria',
          category: 'CONTROLE',
          icon: 'FileSearch',
          roles: ['ADMIN'],
        },
      ],
    },

    {
      id: 'suporte',
      name: 'Suporte',
      description: 'Central de suporte e tickets',
      path: '/support',
      topNav: true,
      icon: 'LifeBuoy',
      group: 'Sistema',
      functions: [
        {
          id: 'support-tickets',
          name: 'Tickets',
          subtitle: 'Abrir e acompanhar tickets',
          path: '/support/tickets',
          category: 'OPERACIONAL',
          icon: 'Ticket',
        },
        {
          id: 'support-new',
          name: 'Novo Ticket',
          subtitle: 'Abrir chamado de suporte',
          path: '/support/tickets/new',
          category: 'OPERACIONAL',
          icon: 'Plus',
        },
      ],
    },

    // =========================================================================
    // ADMINISTRAÇÃO
    // =========================================================================
    {
      id: 'administracao',
      name: 'Administração',
      description: 'Gestão de usuários e sistema',
      path: '/admin',
      icon: 'Shield',
      group: 'Serviços Técnicos',
      roles: ['ADMIN'] as UserRole[],
      functions: [
        {
          id: 'admin-usuarios',
          name: 'Usuários',
          subtitle: 'Gestão de usuários',
          path: '/admin/usuarios',
          category: 'CONTROLE',
          icon: 'Users',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-perfis',
          name: 'Perfis e Roles',
          subtitle: 'Permissões',
          path: '/admin/perfis',
          category: 'CONTROLE',
          icon: 'UserCog',
          roles: ['ADMIN'],
        },
        {
          id: 'admin-entidades',
          name: 'Entidades',
          subtitle: 'Organizações e unidades',
          path: '/admin/entidades',
          category: 'CONTROLE',
          icon: 'Building2',
        },
        {
          id: 'admin-auditoria',
          name: 'Auditoria',
          subtitle: 'Logs de ações',
          path: '/admin/auditoria',
          category: 'CONTROLE',
          icon: 'FileSearch',
        },
      ],
    },
  ],
}

export default NAVIGATION
