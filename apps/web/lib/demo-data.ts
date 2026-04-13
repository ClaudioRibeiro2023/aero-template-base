/**
 * Centralized demo data for NEXT_PUBLIC_DEMO_MODE=true.
 *
 * When running without Supabase (demo mode), API routes return this mock data
 * instead of querying the database. This prevents 500 errors and infinite
 * React Query retries.
 *
 * Used by: all API routes under app/api/ that access repositories or SupabaseDbClient.
 */

export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true'

const now = new Date().toISOString()
const yesterday = new Date(Date.now() - 86_400_000).toISOString()
const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString()

// ── Tasks ──

export const DEMO_TASKS = [
  {
    id: 'demo-task-1',
    title: 'Configurar ambiente de desenvolvimento',
    description: 'Instalar dependências e configurar variáveis de ambiente',
    status: 'done',
    priority: 'high',
    assignee_id: 'demo-user-001',
    created_by: 'demo-user-001',
    created_at: twoDaysAgo,
    updated_at: yesterday,
  },
  {
    id: 'demo-task-2',
    title: 'Implementar autenticação OAuth',
    description: 'Integrar login via Google e GitHub',
    status: 'in_progress',
    priority: 'high',
    assignee_id: 'demo-user-001',
    created_by: 'demo-user-001',
    created_at: yesterday,
    updated_at: now,
  },
  {
    id: 'demo-task-3',
    title: 'Criar testes unitários',
    description: 'Cobrir hooks e componentes principais com vitest',
    status: 'todo',
    priority: 'medium',
    assignee_id: null,
    created_by: 'demo-user-001',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'demo-task-4',
    title: 'Documentar API endpoints',
    description: 'Gerar documentação OpenAPI para todas as rotas',
    status: 'todo',
    priority: 'low',
    assignee_id: null,
    created_by: 'demo-user-001',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'demo-task-5',
    title: 'Revisar performance do dashboard',
    description: 'Otimizar queries e lazy loading de componentes',
    status: 'in_progress',
    priority: 'medium',
    assignee_id: 'demo-user-002',
    created_by: 'demo-user-001',
    created_at: twoDaysAgo,
    updated_at: now,
  },
]

// ── Users ──

export const DEMO_USERS = [
  {
    id: 'demo-user-001',
    email: 'admin@template.dev',
    display_name: 'Admin Demo',
    avatar_url: null,
    phone: '+55 11 99999-0001',
    department: 'Tecnologia',
    role: 'ADMIN',
    is_active: true,
    tenant_id: 'demo-tenant',
    created_at: twoDaysAgo,
    updated_at: now,
  },
  {
    id: 'demo-user-002',
    email: 'maria@template.dev',
    display_name: 'Maria Silva',
    avatar_url: null,
    phone: '+55 11 99999-0002',
    department: 'Produto',
    role: 'GESTOR',
    is_active: true,
    tenant_id: 'demo-tenant',
    created_at: twoDaysAgo,
    updated_at: now,
  },
  {
    id: 'demo-user-003',
    email: 'joao@template.dev',
    display_name: 'João Santos',
    avatar_url: null,
    phone: null,
    department: 'Operações',
    role: 'OPERADOR',
    is_active: true,
    tenant_id: 'demo-tenant',
    created_at: twoDaysAgo,
    updated_at: yesterday,
  },
  {
    id: 'demo-user-004',
    email: 'ana@template.dev',
    display_name: 'Ana Costa',
    avatar_url: null,
    phone: null,
    department: 'RH',
    role: 'VIEWER',
    is_active: false,
    tenant_id: 'demo-tenant',
    created_at: twoDaysAgo,
    updated_at: yesterday,
  },
]

// ── Audit Logs ──

export const DEMO_AUDIT_LOGS = [
  {
    id: 'demo-log-1',
    user_id: 'demo-user-001',
    action: 'LOGIN',
    resource: 'auth',
    resource_id: null,
    details: { method: 'demo' },
    created_at: now,
  },
  {
    id: 'demo-log-2',
    user_id: 'demo-user-001',
    action: 'CREATE',
    resource: 'tasks',
    resource_id: 'demo-task-1',
    details: { title: 'Configurar ambiente' },
    created_at: yesterday,
  },
  {
    id: 'demo-log-3',
    user_id: 'demo-user-002',
    action: 'UPDATE',
    resource: 'profiles',
    resource_id: 'demo-user-002',
    details: { field: 'department' },
    created_at: twoDaysAgo,
  },
]

// ── Roles ──

export const DEMO_ROLES = [
  {
    id: 'demo-role-1',
    tenant_id: 'demo-tenant',
    name: 'ADMIN',
    display_name: 'Administrador',
    description: 'Acesso completo ao sistema',
    permissions: ['*'],
    hierarchy_level: 100,
    is_system: true,
    created_at: twoDaysAgo,
    updated_at: twoDaysAgo,
  },
  {
    id: 'demo-role-2',
    tenant_id: 'demo-tenant',
    name: 'GESTOR',
    display_name: 'Gestor',
    description: 'Gerenciamento de equipes e projetos',
    permissions: ['read', 'write', 'manage_team'],
    hierarchy_level: 70,
    is_system: true,
    created_at: twoDaysAgo,
    updated_at: twoDaysAgo,
  },
  {
    id: 'demo-role-3',
    tenant_id: 'demo-tenant',
    name: 'OPERADOR',
    display_name: 'Operador',
    description: 'Execução de tarefas operacionais',
    permissions: ['read', 'write'],
    hierarchy_level: 40,
    is_system: true,
    created_at: twoDaysAgo,
    updated_at: twoDaysAgo,
  },
  {
    id: 'demo-role-4',
    tenant_id: 'demo-tenant',
    name: 'VIEWER',
    display_name: 'Visualizador',
    description: 'Acesso somente leitura',
    permissions: ['read'],
    hierarchy_level: 10,
    is_system: true,
    created_at: twoDaysAgo,
    updated_at: twoDaysAgo,
  },
]

// ── Feature Flags ──

export const DEMO_FEATURE_FLAGS = [
  {
    id: 'demo-flag-1',
    tenant_id: 'demo-tenant',
    flag_name: 'dark_mode',
    description: 'Habilitar modo escuro',
    enabled: true,
    created_at: twoDaysAgo,
    updated_at: now,
  },
  {
    id: 'demo-flag-2',
    tenant_id: 'demo-tenant',
    flag_name: 'beta_features',
    description: 'Funcionalidades experimentais',
    enabled: false,
    created_at: twoDaysAgo,
    updated_at: twoDaysAgo,
  },
  {
    id: 'demo-flag-3',
    tenant_id: 'demo-tenant',
    flag_name: 'notifications_v2',
    description: 'Nova versão do sistema de notificações',
    enabled: true,
    created_at: yesterday,
    updated_at: now,
  },
]

// ── Support Tickets ──

export const DEMO_TICKETS = [
  {
    id: 'demo-ticket-1',
    title: 'Botão de exportar não funciona',
    description: 'Ao clicar em "Exportar CSV" nada acontece',
    status: 'open',
    priority: 'high',
    category: 'bug',
    created_by: 'demo-user-002',
    assignee_id: 'demo-user-001',
    created_at: yesterday,
    updated_at: now,
  },
  {
    id: 'demo-ticket-2',
    title: 'Sugestão: filtro por data no relatório',
    description: 'Seria útil poder filtrar relatórios por intervalo de datas',
    status: 'in_progress',
    priority: 'medium',
    category: 'feature',
    created_by: 'demo-user-003',
    assignee_id: null,
    created_at: twoDaysAgo,
    updated_at: yesterday,
  },
  {
    id: 'demo-ticket-3',
    title: 'Dúvida sobre permissões',
    description: 'Como configurar permissões para o time de operações?',
    status: 'closed',
    priority: 'low',
    category: 'question',
    created_by: 'demo-user-003',
    assignee_id: 'demo-user-001',
    created_at: twoDaysAgo,
    updated_at: twoDaysAgo,
  },
]

// ── Organizations ──

export const DEMO_ORGANIZATIONS = [
  {
    id: 'demo-org-1',
    name: 'Empresa Demo',
    slug: 'empresa-demo',
    plan: 'pro',
    settings: {},
    logo_url: null,
    memberRole: 'owner',
  },
]

// ── Admin Config ──

export const DEMO_ADMIN_CONFIG = {
  id: 'demo-config-1',
  tenant_id: 'demo-tenant',
  branding: {
    appName: 'Template Platform',
    logoUrl: null,
    faviconUrl: null,
    primaryColor: '#0087A8',
    secondaryColor: '#6366f1',
  },
  theme: {
    mode: 'system',
    density: 'comfortable',
    borderRadius: 'md',
    fontFamily: 'Inter, sans-serif',
  },
  navigation: [],
  notifications: {
    emailEnabled: true,
    pushEnabled: false,
    systemAlertsEnabled: true,
    weeklyReportsEnabled: false,
  },
  maintenance_mode: false,
  default_language: 'pt-BR',
  default_timezone: 'America/Sao_Paulo',
  setup_complete: true,
  created_at: twoDaysAgo,
  updated_at: now,
}

// ── Quality Reports ──

export const DEMO_QUALITY_REPORTS = [
  {
    id: 'demo-report-1',
    overall_score: 87,
    results: {
      type_safety: 90,
      security: 85,
      testing: 80,
      code_quality: 88,
      accessibility: 85,
      performance: 90,
      i18n: 82,
      functional: 86,
    },
    created_by: 'demo-user-001',
    created_at: now,
  },
]
