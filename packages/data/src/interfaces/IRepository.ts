/**
 * IRepository — Interface genérica para acesso a dados.
 *
 * Define operações CRUD + paginação + filtros de forma agnóstica ao provider.
 * Implementações concretas: SupabaseRepository, PrismaRepository, etc.
 */

// ── Paginação ──

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  pages: number
}

// ── Filtros ──

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'in'
  | 'is'

export interface FilterCondition {
  field: string
  operator: FilterOperator
  value: unknown
}

// ── Ordenação ──

export interface SortParams {
  field: string
  ascending?: boolean
}

// ── Opções de query ──

export interface QueryOptions {
  filters?: FilterCondition[]
  sort?: SortParams[]
  pagination?: PaginationParams
  select?: string
}

// ── Interface principal ──

export interface IRepository<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  /**
   * Busca múltiplos registros com filtros, ordenação e paginação.
   */
  findMany(options?: QueryOptions): Promise<PaginatedResult<T>>

  /**
   * Busca um registro por ID.
   */
  findById(id: string, select?: string): Promise<T | null>

  /**
   * Cria um novo registro.
   */
  create(data: TCreate): Promise<T>

  /**
   * Atualiza um registro existente.
   */
  update(id: string, data: TUpdate): Promise<T | null>

  /**
   * Remove um registro por ID.
   */
  delete(id: string): Promise<boolean>

  /**
   * Conta registros que atendem aos filtros.
   */
  count(filters?: FilterCondition[]): Promise<number>
}
