// Navigation Types
export type UserRole = 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'VIEWER'

export type NavCategory = 'ANALISE' | 'MAPEAMENTO' | 'INDICADORES' | 'CONTROLE' | 'OPERACIONAL'

export interface FunctionItem {
  id: string
  name: string
  path: string
  category?: NavCategory
  icon?: string
  subtitle?: string
  roles?: UserRole[]
}

export interface AppModule {
  id: string
  name: string
  description?: string
  path: string
  topNav?: boolean
  icon?: string
  badge?: string
  group?: string
  functions?: FunctionItem[]
  roles?: UserRole[]
}

export interface NavigationMap {
  modules: AppModule[]
}
