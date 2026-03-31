/**
 * Configuração Padrão de Navegação
 *
 * Este arquivo contém a configuração inicial/fallback para a navegação.
 * Em produção, esta configuração pode ser sobrescrita pela API.
 */

import type {
  NavigationConfig,
  ModuleConfig,
  FilterConfig,
  CategoryConfig,
} from './navigation-schema'

// ═══════════════════════════════════════════════════════════════
// CATEGORIAS PADRÃO
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'ANALISE', label: 'Análise', order: 1, defaultExpanded: true },
  { id: 'MAPEAMENTO', label: 'Mapeamento', order: 2, defaultExpanded: true },
  { id: 'INDICADORES', label: 'Indicadores', order: 3, defaultExpanded: true },
  { id: 'CONTROLE', label: 'Controle', order: 4, defaultExpanded: true },
  { id: 'OPERACIONAL', label: 'Operacional', order: 5, defaultExpanded: true },
  { id: 'CONFIG', label: 'Configuração', order: 6, defaultExpanded: false },
  { id: 'OTHER', label: 'Outros', order: 99, defaultExpanded: true },
]

// ═══════════════════════════════════════════════════════════════
// FILTROS PADRÃO
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_FILTERS: FilterConfig[] = [
  {
    id: 'filter-category',
    name: 'Categoria',
    type: 'multiselect',
    placeholder: 'Filtrar por categoria...',
    options: [
      { value: 'ANALISE', label: 'Análise' },
      { value: 'MAPEAMENTO', label: 'Mapeamento' },
      { value: 'INDICADORES', label: 'Indicadores' },
      { value: 'CONTROLE', label: 'Controle' },
      { value: 'OPERACIONAL', label: 'Operacional' },
    ],
    order: 1,
    enabled: true,
    appliesTo: { global: true },
  },
  {
    id: 'filter-status',
    name: 'Status',
    type: 'select',
    placeholder: 'Todos os status',
    options: [
      { value: 'all', label: 'Todos' },
      { value: 'active', label: 'Ativos' },
      { value: 'inactive', label: 'Inativos' },
      { value: 'beta', label: 'Beta' },
    ],
    order: 2,
    enabled: true,
    appliesTo: { modules: ['etl', 'observabilidade'] },
  },
  {
    id: 'filter-date',
    name: 'Período',
    type: 'daterange',
    placeholder: 'Selecionar período...',
    order: 3,
    enabled: true,
    appliesTo: { modules: ['relatorios', 'observabilidade'] },
  },
]

// ═══════════════════════════════════════════════════════════════
// MÓDULOS PADRÃO
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_MODULES: ModuleConfig[] = [
  // ─────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Painel principal com KPIs e visão geral',
    icon: 'LayoutGrid',
    path: '/dashboard',
    enabled: true,
    order: 1,
    roles: [],
    showInSidebar: true,
    showInFunctionsPanel: true,
    group: 'Principal',
    functions: [
      {
        id: 'dashboard-main',
        moduleId: 'dashboard',
        name: 'Visão Geral',
        subtitle: 'KPIs e métricas principais',
        path: '/dashboard',
        category: 'INDICADORES',
        enabled: true,
        order: 0,
        roles: [],
        tags: ['kpi', 'metricas'],
      },
      {
        id: 'dashboard-analytics',
        moduleId: 'dashboard',
        name: 'Analytics',
        subtitle: 'Análises detalhadas',
        path: '/dashboard/analytics',
        category: 'ANALISE',
        enabled: true,
        order: 1,
        roles: [],
        tags: ['graficos', 'analise'],
      },
      {
        id: 'dashboard-alerts',
        moduleId: 'dashboard',
        name: 'Alertas',
        subtitle: 'Notificações e watchlist',
        path: '/dashboard/alerts',
        category: 'CONTROLE',
        enabled: true,
        order: 2,
        roles: [],
        tags: ['alertas', 'notificacoes'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // RELATÓRIOS
  // ─────────────────────────────────────────────────────────────
  {
    id: 'relatorios',
    name: 'Relatórios',
    description: 'Relatórios e exportações',
    icon: 'BarChart3',
    path: '/relatorios',
    enabled: true,
    order: 2,
    roles: [],
    showInSidebar: true,
    showInFunctionsPanel: true,
    group: 'Principal',
    functions: [
      {
        id: 'relatorios-gerenciais',
        moduleId: 'relatorios',
        name: 'Gerenciais',
        subtitle: 'Relatórios de gestão',
        path: '/relatorios',
        category: 'INDICADORES',
        enabled: true,
        order: 0,
        roles: [],
        tags: ['relatorios', 'gestao'],
      },
      {
        id: 'relatorios-operacionais',
        moduleId: 'relatorios',
        name: 'Operacionais',
        subtitle: 'Relatórios de operação',
        path: '/relatorios/operacionais',
        category: 'OPERACIONAL',
        enabled: true,
        order: 1,
        roles: [],
        tags: ['relatorios', 'operacao'],
      },
      {
        id: 'exportacoes',
        moduleId: 'relatorios',
        name: 'Exportações',
        subtitle: 'Download de dados',
        path: '/relatorios/export',
        category: 'OPERACIONAL',
        enabled: true,
        order: 2,
        roles: [],
        tags: ['export', 'download'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // TAREFAS — CRUD de referência (Sprint 7)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'tasks',
    name: 'Tarefas',
    description: 'Gerenciar tarefas do projeto',
    icon: 'CheckCircle',
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
        category: 'OPERACIONAL',
        enabled: true,
        order: 0,
        roles: [],
        tags: ['tasks', 'crud'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // CONFIGURAÇÕES
  // (Example modules removed — add via module registry)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'configuracoes',
    name: 'Configurações',
    description: 'Parâmetros do sistema',
    icon: 'Settings',
    path: '/admin/config',
    enabled: true,
    order: 11,
    roles: ['ADMIN', 'GESTOR'],
    showInSidebar: true,
    showInFunctionsPanel: true,
    group: 'Administração',
    functions: [
      {
        id: 'config-geral',
        moduleId: 'configuracoes',
        name: 'Geral',
        subtitle: 'Configurações gerais',
        path: '/admin/config',
        category: 'CONFIG',
        enabled: true,
        order: 0,
        roles: [],
        tags: ['config', 'geral'],
      },
      {
        id: 'config-aparencia',
        moduleId: 'configuracoes',
        name: 'Aparência',
        subtitle: 'Tema e personalização',
        path: '/admin/config/aparencia',
        category: 'CONFIG',
        enabled: true,
        order: 1,
        roles: [],
        tags: ['tema', 'aparencia'],
      },
      {
        id: 'config-notificacoes',
        moduleId: 'configuracoes',
        name: 'Notificações',
        subtitle: 'Alertas e emails',
        path: '/admin/config/notificacoes',
        category: 'CONFIG',
        enabled: true,
        order: 2,
        roles: [],
        tags: ['notificacoes', 'alertas'],
      },
      {
        id: 'config-integracao',
        moduleId: 'configuracoes',
        name: 'Integrações',
        subtitle: 'APIs e webhooks',
        path: '/admin/config/integracoes',
        category: 'CONFIG',
        enabled: true,
        order: 3,
        roles: [],
        tags: ['api', 'webhook'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // ADMINISTRAÇÃO
  // (Observability, Docs, LGPD modules removed — available in template-modules repo)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'administracao',
    name: 'Administração',
    description: 'Gestão de usuários e sistema',
    icon: 'Users',
    path: '/admin/usuarios',
    enabled: true,
    order: 30,
    roles: ['ADMIN'],
    showInSidebar: true,
    showInFunctionsPanel: true,
    group: 'Administração',
    functions: [
      {
        id: 'admin-usuarios',
        moduleId: 'administracao',
        name: 'Usuários',
        subtitle: 'Gestão de usuários',
        path: '/admin/usuarios',
        category: 'CONTROLE',
        enabled: true,
        order: 0,
        roles: ['ADMIN'],
        tags: ['usuarios', 'gestao'],
      },
      {
        id: 'admin-perfis',
        moduleId: 'administracao',
        name: 'Perfis e Roles',
        subtitle: 'Permissões',
        path: '/admin/perfis',
        category: 'CONTROLE',
        enabled: true,
        order: 1,
        roles: ['ADMIN'],
        tags: ['perfis', 'roles'],
      },
      {
        id: 'admin-entidades',
        moduleId: 'administracao',
        name: 'Entidades',
        subtitle: 'Organizações e unidades',
        path: '/admin/entidades',
        category: 'CONTROLE',
        enabled: true,
        order: 2,
        roles: [],
        tags: ['entidades', 'organizacoes'],
      },
      {
        id: 'admin-auditoria',
        moduleId: 'administracao',
        name: 'Auditoria',
        subtitle: 'Logs de ações',
        path: '/admin/auditoria',
        category: 'CONTROLE',
        enabled: true,
        order: 3,
        roles: [],
        tags: ['auditoria', 'logs'],
      },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO COMPLETA PADRÃO
// ═══════════════════════════════════════════════════════════════

const _env =
  typeof import.meta !== 'undefined'
    ? ((import.meta as unknown as { env?: Record<string, string> }).env ?? {})
    : {}

export const DEFAULT_NAVIGATION_CONFIG: NavigationConfig = {
  version: '1.0.0',
  appName: _env.VITE_APP_NAME || process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform',
  appVersion: _env.VITE_APP_VERSION || process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  modules: DEFAULT_MODULES,
  filters: DEFAULT_FILTERS,
  categories: DEFAULT_CATEGORIES,
  settings: {
    enableFavorites: true,
    enableGlobalSearch: true,
    enableKeyboardShortcuts: true,
    defaultTheme: 'system',
    defaultLanguage: 'pt-BR',
  },
  updatedAt: new Date().toISOString(),
}

export default DEFAULT_NAVIGATION_CONFIG
