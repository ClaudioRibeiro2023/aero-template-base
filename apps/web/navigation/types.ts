// Navigation Types
// UserRole importado de @template/types — fonte canônica: packages/types/src/auth.ts
import type { UserRole } from '@template/types'
export type { UserRole }

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
