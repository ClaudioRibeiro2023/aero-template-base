/**
 * Navigation Configuration Schema
 *
 * Define a estrutura de dados para configuração dinâmica de:
 * - Módulos (seções principais da aplicação)
 */
import type { UserRole } from '@template/types'

/**
 * Navigation Configuration Schema (continued)
 * - Funções (páginas/features dentro de módulos)
 * - Filtros (filtros aplicáveis às funções)
 * - Categorias (agrupamentos de funções)
 */

// ═══════════════════════════════════════════════════════════════
// TIPOS BASE
// ═══════════════════════════════════════════════════════════════

// UserRole importado de @template/types — fonte canônica: packages/types/src/auth.ts
export type { UserRole } from '@template/types'

/** Categorias para agrupamento de funções */
export type FunctionCategory =
  | 'ANALISE'
  | 'MAPEAMENTO'
  | 'INDICADORES'
  | 'CONTROLE'
  | 'OPERACIONAL'
  | 'CONFIG'
  | 'OTHER'

/** Tipos de filtro disponíveis */
export type FilterType =
  | 'select' // Dropdown único
  | 'multiselect' // Seleção múltipla
  | 'search' // Input de busca
  | 'date' // Seletor de data
  | 'daterange' // Intervalo de datas
  | 'toggle' // On/Off
  | 'number' // Input numérico

/** Ícones disponíveis (subset do Lucide) */
export type IconName =
  | 'Home'
  | 'LayoutGrid'
  | 'BarChart3'
  | 'FileText'
  | 'Users'
  | 'Settings'
  | 'Database'
  | 'Activity'
  | 'Shield'
  | 'Bell'
  | 'Search'
  | 'Filter'
  | 'Calendar'
  | 'Clock'
  | 'Star'
  | 'Folder'
  | 'File'
  | 'Upload'
  | 'Download'
  | 'Trash'
  | 'Edit'
  | 'Plus'
  | 'Minus'
  | 'Check'
  | 'X'
  | 'ChevronRight'
  | 'ChevronDown'
  | 'ChevronUp'
  | 'ChevronLeft'
  | 'ArrowRight'
  | 'ArrowLeft'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ExternalLink'
  | 'Link'
  | 'Copy'
  | 'Clipboard'
  | 'Eye'
  | 'EyeOff'
  | 'Lock'
  | 'Unlock'
  | 'Key'
  | 'User'
  | 'UserPlus'
  | 'UserMinus'
  | 'UserCheck'
  | 'Mail'
  | 'Phone'
  | 'MapPin'
  | 'Globe'
  | 'Server'
  | 'Cpu'
  | 'HardDrive'
  | 'Wifi'
  | 'AlertTriangle'
  | 'AlertCircle'
  | 'Info'
  | 'HelpCircle'
  | string // Permite qualquer string para flexibilidade

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE FUNÇÕES
// ═══════════════════════════════════════════════════════════════

/** Configuração de uma função/página dentro de um módulo */
export interface FunctionConfig {
  /** ID único da função */
  id: string

  /** ID do módulo pai */
  moduleId: string

  /** Nome de exibição */
  name: string

  /** Subtítulo/descrição curta */
  subtitle?: string

  /** Caminho da rota (relativo ao módulo ou absoluto) */
  path: string

  /** Ícone (nome do Lucide icon) */
  icon?: IconName

  /** Categoria para agrupamento */
  category: FunctionCategory

  /** Se a função está habilitada */
  enabled: boolean

  /** Ordem de exibição dentro da categoria */
  order: number

  /** Roles que podem acessar esta função */
  roles: UserRole[]

  /** Tags para busca e filtros */
  tags: string[]

  /** IDs dos filtros aplicáveis a esta função */
  filterIds?: string[]

  /** Metadados customizados */
  metadata?: Record<string, unknown>
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE MÓDULOS
// ═══════════════════════════════════════════════════════════════

/** Configuração de um módulo (seção principal) */
export interface ModuleConfig {
  /** ID único do módulo */
  id: string

  /** Nome de exibição */
  name: string

  /** Descrição do módulo */
  description?: string

  /** Ícone (nome do Lucide icon) */
  icon: IconName

  /** Caminho base da rota */
  path: string

  /** Se o módulo está habilitado */
  enabled: boolean

  /** Ordem de exibição na sidebar */
  order: number

  /** Roles que podem ver este módulo */
  roles: UserRole[]

  /** Funções deste módulo */
  functions: FunctionConfig[]

  /** Se deve mostrar na sidebar */
  showInSidebar: boolean

  /** Se deve mostrar no painel de funções */
  showInFunctionsPanel: boolean

  /** Grupo para agrupamento na sidebar (ex: 'Principal', 'Módulos', 'Administração') */
  group?: string

  /** Cor do módulo (para personalização visual) */
  color?: string

  /** Metadados customizados */
  metadata?: Record<string, unknown>
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE FILTROS
// ═══════════════════════════════════════════════════════════════

/** Opção de um filtro select/multiselect */
export interface FilterOption {
  value: string
  label: string
  icon?: IconName
  color?: string
}

/** Configuração de um filtro */
export interface FilterConfig {
  /** ID único do filtro */
  id: string

  /** Nome de exibição */
  name: string

  /** Tipo do filtro */
  type: FilterType

  /** Placeholder do input */
  placeholder?: string

  /** Opções (para select/multiselect) */
  options?: FilterOption[]

  /** Valor padrão */
  defaultValue?: unknown

  /** Se é obrigatório */
  required?: boolean

  /** Ordem de exibição */
  order: number

  /** IDs de módulos/funções onde este filtro aparece */
  appliesTo: {
    modules?: string[]
    functions?: string[]
    global?: boolean // Aparece em todos
  }

  /** Se o filtro está habilitado */
  enabled: boolean

  /** Validações */
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE CATEGORIAS
// ═══════════════════════════════════════════════════════════════

/** Configuração de uma categoria de funções */
export interface CategoryConfig {
  /** ID da categoria */
  id: FunctionCategory

  /** Nome de exibição */
  label: string

  /** Ordem de exibição */
  order: number

  /** Se está expandida por padrão */
  defaultExpanded: boolean

  /** Ícone opcional */
  icon?: IconName

  /** Cor opcional */
  color?: string
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE BRANDING PER-PLATFORM
// ═══════════════════════════════════════════════════════════════

/** Configuração de branding visual da plataforma */
export interface BrandingConfig {
  /** Cor primária da marca (hex) */
  primaryColor?: string

  /** Cor secundária da marca (hex) */
  secondaryColor?: string

  /** Cor de destaque/accent (hex) */
  accentColor?: string

  /** Gradiente do sidebar — array de 2+ cores hex */
  sidebarGradient?: string[]

  /** Cor de fundo do sidebar (se não usar gradiente) */
  sidebarBg?: string

  /** Logo URL compacta (ícone 32x32) para sidebar collapsed */
  logoCompactUrl?: string

  /** Favicon URL override */
  faviconUrl?: string
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURAÇÃO COMPLETA DE NAVEGAÇÃO
// ═══════════════════════════════════════════════════════════════

/** Configuração completa de navegação da aplicação */
export interface NavigationConfig {
  /** Versão do schema */
  version: string

  /** Nome da aplicação */
  appName: string

  /** Versão da aplicação */
  appVersion: string

  /** Logo URL (opcional) */
  logoUrl?: string

  /** Branding visual per-platform (opcional) */
  branding?: BrandingConfig

  /** Módulos configurados */
  modules: ModuleConfig[]

  /** Filtros globais */
  filters: FilterConfig[]

  /** Configuração das categorias */
  categories: CategoryConfig[]

  /** Configurações globais */
  settings: {
    /** Mostrar favoritos */
    enableFavorites: boolean

    /** Mostrar busca global */
    enableGlobalSearch: boolean

    /** Mostrar atalhos de teclado */
    enableKeyboardShortcuts: boolean

    /** Tema padrão */
    defaultTheme: 'light' | 'dark' | 'system'

    /** Idioma padrão */
    defaultLanguage: string
  }

  /** Timestamp da última atualização */
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// HELPERS E UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════

/** Cria um módulo com valores padrão */
export function createModuleConfig(
  partial: Partial<ModuleConfig> & Pick<ModuleConfig, 'id' | 'name' | 'path' | 'icon'>
): ModuleConfig {
  return {
    enabled: true,
    order: 0,
    roles: [],
    functions: [],
    showInSidebar: true,
    showInFunctionsPanel: true,
    ...partial,
  }
}

/** Cria uma função com valores padrão */
export function createFunctionConfig(
  partial: Partial<FunctionConfig> & Pick<FunctionConfig, 'id' | 'moduleId' | 'name' | 'path'>
): FunctionConfig {
  return {
    category: 'OTHER',
    enabled: true,
    order: 0,
    roles: [],
    tags: [],
    ...partial,
  }
}

/** Cria um filtro com valores padrão */
export function createFilterConfig(
  partial: Partial<FilterConfig> & Pick<FilterConfig, 'id' | 'name' | 'type'>
): FilterConfig {
  return {
    order: 0,
    enabled: true,
    appliesTo: { global: false },
    ...partial,
  }
}

/** Valida uma configuração de navegação */
export function validateNavigationConfig(config: NavigationConfig): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validar módulos
  const moduleIds = new Set<string>()
  for (const module of config.modules) {
    if (moduleIds.has(module.id)) {
      errors.push(`Módulo duplicado: ${module.id}`)
    }
    moduleIds.add(module.id)

    if (!module.path.startsWith('/')) {
      errors.push(`Path do módulo ${module.id} deve começar com /`)
    }

    // Validar funções
    const functionIds = new Set<string>()
    for (const func of module.functions) {
      if (functionIds.has(func.id)) {
        errors.push(`Função duplicada no módulo ${module.id}: ${func.id}`)
      }
      functionIds.add(func.id)
    }
  }

  // Validar filtros
  const filterIds = new Set<string>()
  for (const filter of config.filters) {
    if (filterIds.has(filter.id)) {
      errors.push(`Filtro duplicado: ${filter.id}`)
    }
    filterIds.add(filter.id)
  }

  return { valid: errors.length === 0, errors }
}

/** Serializa config para JSON */
export function serializeConfig(config: NavigationConfig): string {
  return JSON.stringify(config, null, 2)
}

/** Deserializa config de JSON */
export function deserializeConfig(json: string): NavigationConfig {
  return JSON.parse(json) as NavigationConfig
}
