/**
 * IDbClient — Interface abstrata para clientes de banco de dados.
 *
 * Permite que o data layer trabalhe com qualquer provider (Supabase, Prisma, Drizzle)
 * sem que as camadas superiores saibam qual está em uso.
 */

export type DataProvider = 'supabase' | 'prisma' | 'drizzle' | 'rest'

export interface IDbClient {
  /** Identificador do provider ativo */
  readonly provider: DataProvider
}

export interface IServerDbClient extends IDbClient {
  /**
   * Retorna cliente com permissões de admin (service role).
   * Uso: operações que bypassam RLS (criação de usuários, etc.).
   */
  asAdmin(): unknown

  /**
   * Retorna cliente no contexto do usuário autenticado (cookie-based).
   * Uso: operações que respeitam RLS.
   */
  asUser(): Promise<unknown>
}
