/**
 * @template/modules — Module Manifest System
 *
 * Um ModuleManifest é a fonte única de verdade sobre um módulo.
 * Declara tudo: metadata, dependências, rotas, tabelas, hooks, navegação.
 *
 * Categorias:
 * - core: sempre ativo, não pode ser desabilitado (auth, admin, settings, search)
 * - default: ativo por padrão, pode ser desabilitado
 * - optional: inativo por padrão, deve ser habilitado explicitamente
 * - utility: serviço interno consumido por outros módulos (file-upload)
 */

import type { ModuleDefinition } from './registry'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type ModuleCategory = 'core' | 'default' | 'optional' | 'utility'

export interface ModuleEnvVar {
  /** Nome da variável (ex: NEXT_PUBLIC_SUPABASE_URL) */
  key: string
  /** Se é obrigatória para o módulo funcionar */
  required: boolean
  /** Descrição da variável */
  description: string
}

export interface ModuleFunctionDef {
  id: string
  moduleId: string
  name: string
  subtitle?: string
  path: string
  icon?: string
  category: string
  enabled: boolean
  order: number
  roles: string[]
  tags: string[]
}

export interface ModuleManifest extends ModuleDefinition {
  /** Nome de exibição do módulo */
  name: string

  /** Descrição curta */
  description: string

  /** Versão semântica do módulo */
  version: string

  /** Categoria de lifecycle */
  category: ModuleCategory

  // ── Dependências ──────────────────────────────────────────

  /** IDs de módulos dos quais este depende (devem estar enabled) */
  dependencies: string[]

  // ── Rotas ─────────────────────────────────────────────────

  /** Rotas de página que este módulo controla (para gating) */
  routes: string[]

  /** Prefixos de API routes que este módulo controla */
  apiRoutes: string[]

  // ── Infraestrutura ────────────────────────────────────────

  /** Tabelas Supabase que este módulo requer */
  requiredTables: string[]

  /** Variáveis de ambiente necessárias */
  envVars: ModuleEnvVar[]

  /** Feature flag keys associadas */
  featureFlags: string[]

  // ── Developer Experience ──────────────────────────────────

  /** Hooks React que este módulo provê */
  hooks: string[]

  /** Componentes principais que este módulo provê */
  components: string[]

  // ── Navegação (compatível com ModuleConfig) ───────────────

  /** Ícone Lucide para sidebar */
  icon: string

  /** Rota base do módulo */
  path: string

  /** Roles com acesso (vazio = todos) */
  roles: string[]

  /** Mostrar na sidebar */
  showInSidebar: boolean

  /** Grupo na sidebar */
  group: string

  /** Funções/páginas dentro do módulo */
  functions: ModuleFunctionDef[]
}

// ═══════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════

/**
 * Define um manifest de módulo com validação de tipo.
 * Não registra automaticamente — apenas retorna o manifest tipado.
 */
export function defineManifest(manifest: ModuleManifest): ModuleManifest {
  return Object.freeze(manifest)
}
