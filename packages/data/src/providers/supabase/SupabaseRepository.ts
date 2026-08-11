/**
 * SupabaseRepository — Implementação genérica de IRepository para Supabase.
 *
 * Traduz QueryOptions (filtros, ordenação, paginação) em chamadas
 * ao Supabase client (.from().select().eq().order().range()).
 *
 * Repositórios por entidade estendem esta classe para adicionar
 * métodos específicos (ex: TaskRepository.findByAssignee()).
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  IRepository,
  QueryOptions,
  PaginatedResult,
  FilterCondition,
} from '../../interfaces/IRepository'
import type { SupabaseDbClient } from './SupabaseDbClient'

export interface SupabaseRepositoryConfig {
  /** Nome da tabela no Supabase */
  table: string
  /** Colunas padrão para select (se não especificado em QueryOptions) */
  defaultSelect?: string
  /** Usar cliente admin (service role) em vez de cookie-based */
  useAdmin?: boolean
}

export class SupabaseRepository<
  T,
  TCreate = Partial<T>,
  TUpdate = Partial<T>,
> implements IRepository<T, TCreate, TUpdate> {
  protected readonly table: string
  protected readonly defaultSelect: string
  protected readonly useAdmin: boolean

  constructor(
    protected readonly dbClient: SupabaseDbClient,
    config: SupabaseRepositoryConfig
  ) {
    this.table = config.table
    this.defaultSelect = config.defaultSelect ?? '*'
    this.useAdmin = config.useAdmin ?? false
  }

  /** Obtém o cliente Supabase correto (admin ou user) */
  protected async getClient(): Promise<SupabaseClient> {
    if (this.useAdmin) {
      return this.dbClient.asAdmin()
    }
    return this.dbClient.asUser()
  }

  async findMany(options?: QueryOptions): Promise<PaginatedResult<T>> {
    const client = await this.getClient()
    const select = options?.select ?? this.defaultSelect
    const page = options?.pagination?.page ?? 1
    const pageSize = options?.pagination?.pageSize ?? 20

    let query = client.from(this.table).select(select, { count: 'exact' })

    // Aplicar filtros
    if (options?.filters) {
      query = this.applyFilters(query, options.filters)
    }

    // Aplicar ordenação
    if (options?.sort && options.sort.length > 0) {
      for (const s of options.sort) {
        query = query.order(s.field, { ascending: s.ascending ?? true })
      }
    }

    // Aplicar paginação
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw new RepositoryError(`findMany em ${this.table}`, error.message)
    }

    const total = count ?? 0
    return {
      data: (data ?? []) as T[],
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
    }
  }

  async findById(id: string, select?: string): Promise<T | null> {
    const client = await this.getClient()
    const { data, error } = await client
      .from(this.table)
      .select(select ?? this.defaultSelect)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw new RepositoryError(`findById em ${this.table}`, error.message)
    }

    return data as T
  }

  async create(input: TCreate): Promise<T> {
    const client = await this.getClient()
    const { data, error } = await client
      .from(this.table)
      .insert(input as Record<string, unknown>)
      .select(this.defaultSelect)
      .single()

    if (error) {
      throw new RepositoryError(`create em ${this.table}`, error.message)
    }

    return data as T
  }

  async update(id: string, input: TUpdate): Promise<T | null> {
    const client = await this.getClient()
    const { data, error } = await client
      .from(this.table)
      .update(input as Record<string, unknown>)
      .eq('id', id)
      .select(this.defaultSelect)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new RepositoryError(`update em ${this.table}`, error.message)
    }

    return data as T
  }

  async delete(id: string): Promise<boolean> {
    const client = await this.getClient()
    const { error } = await client.from(this.table).delete().eq('id', id)

    if (error) {
      throw new RepositoryError(`delete em ${this.table}`, error.message)
    }

    return true
  }

  async count(filters?: FilterCondition[]): Promise<number> {
    const client = await this.getClient()
    let query = client.from(this.table).select('*', { count: 'exact', head: true })

    if (filters) {
      query = this.applyFilters(query, filters)
    }

    const { count, error } = await query

    if (error) {
      throw new RepositoryError(`count em ${this.table}`, error.message)
    }

    return count ?? 0
  }

  // ── Helpers internos ──

  // Supabase query builder é chainable; tipagem mínima para o método genérico de filtros.
  // Generic <Q> preserva o tipo exato do builder no call-site (PostgrestFilterBuilder<...>).
  protected applyFilters<Q>(query: Q, filters: FilterCondition[]): Q {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = query
    for (const f of filters) {
      switch (f.operator) {
        case 'eq':
          q = q.eq(f.field, f.value)
          break
        case 'neq':
          q = q.neq(f.field, f.value)
          break
        case 'gt':
          q = q.gt(f.field, f.value)
          break
        case 'gte':
          q = q.gte(f.field, f.value)
          break
        case 'lt':
          q = q.lt(f.field, f.value)
          break
        case 'lte':
          q = q.lte(f.field, f.value)
          break
        case 'like':
          q = q.like(f.field, f.value)
          break
        case 'ilike':
          q = q.ilike(f.field, f.value)
          break
        case 'in':
          q = q.in(f.field, f.value as unknown[])
          break
        case 'is':
          q = q.is(f.field, f.value)
          break
      }
    }
    return q as Q
  }
}

/**
 * Erro específico do repositório — facilita debugging.
 */
export class RepositoryError extends Error {
  constructor(operation: string, detail: string) {
    super(`[Repository] ${operation}: ${detail}`)
    this.name = 'RepositoryError'
  }
}
