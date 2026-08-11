/**
 * Tipos auxiliares para Supabase query builders.
 *
 * O SDK do Supabase retorna `PostgrestFilterBuilder` / `PostgrestTransformBuilder`
 * com generics fortes, mas em rotas admin que aplicam filtros condicionais
 * a reatribuição encadeada (`q = q.eq(...)`) perde o narrowing e o tsc rejeita.
 *
 * Este alias fornece uma superfície mínima (apenas os métodos usados nas rotas
 * admin) suficiente para tipar as atribuições sem recorrer a `any`.
 *
 * Trade-off consciente: não é o tipo exato do SDK (que muda entre versões),
 * mas evita `any` nas rotas e preserva verificação em call-sites.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Val = any

export interface SupaQuery<T = unknown> extends PromiseLike<{ data: T; count?: number | null; error: { message: string } | null }> {
  eq(col: string, val: Val): SupaQuery<T>
  neq(col: string, val: Val): SupaQuery<T>
  gt(col: string, val: Val): SupaQuery<T>
  gte(col: string, val: Val): SupaQuery<T>
  lt(col: string, val: Val): SupaQuery<T>
  lte(col: string, val: Val): SupaQuery<T>
  in(col: string, vals: ReadonlyArray<Val>): SupaQuery<T>
  is(col: string, val: Val): SupaQuery<T>
  not(col: string, op: string, val: Val): SupaQuery<T>
  like(col: string, pat: string): SupaQuery<T>
  ilike(col: string, pat: string): SupaQuery<T>
  order(col: string, opts?: { ascending?: boolean }): SupaQuery<T>
  limit(n: number): SupaQuery<T>
  range(from: number, to: number): SupaQuery<T>
  select(cols?: string, opts?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }): SupaQuery<T>
}
