/**
 * UserRepository — Acesso a dados para profiles/usuários.
 * Tabela: profiles (+ auth.admin para criação)
 *
 * Operações admin (criação de usuário com auth) usam o cliente service role.
 */
import type { User, UserCreate, UserUpdate } from '@template/types'
import { SupabaseRepository } from '../providers/supabase/SupabaseRepository'
import type { SupabaseDbClient } from '../providers/supabase/SupabaseDbClient'

const DEFAULT_SELECT =
  'id, email, display_name, avatar_url, phone, department, role, is_active, tenant_id, metadata, created_at, updated_at'

export class UserRepository extends SupabaseRepository<User, UserCreate, UserUpdate> {
  constructor(dbClient: SupabaseDbClient) {
    super(dbClient, {
      table: 'profiles',
      defaultSelect: DEFAULT_SELECT,
    })
  }

  /** Busca usuários ativos por role */
  async findByRole(role: string) {
    return this.findMany({
      filters: [
        { field: 'role', operator: 'eq', value: role },
        { field: 'is_active', operator: 'eq', value: true },
      ],
      sort: [{ field: 'display_name', ascending: true }],
    })
  }

  /** Busca por email (exato) */
  async findByEmail(email: string): Promise<User | null> {
    const client = await this.getClient()
    const { data, error } = await client
      .from('profiles')
      .select(DEFAULT_SELECT)
      .eq('email', email)
      .single()

    if (error) return null
    return data as User
  }

  /**
   * Cria usuário no Supabase Auth + profile.
   * Requer cliente admin (service role).
   */
  async createWithAuth(input: UserCreate & { password?: string }): Promise<User> {
    const admin = this.dbClient.asAdmin()

    // 1. Criar no Supabase Auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password ?? undefined,
      email_confirm: true,
      user_metadata: { display_name: input.display_name },
    })

    if (authError) {
      throw new Error(`Erro ao criar usuário no Auth: ${authError.message}`)
    }

    // 2. Atualizar profile (trigger on_auth_user_created pode já ter criado)
    const { data, error } = await admin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: input.email,
        display_name: input.display_name,
        role: input.role ?? 'VIEWER',
        is_active: input.is_active ?? true,
        phone: input.phone ?? null,
        department: input.department ?? null,
      })
      .select(DEFAULT_SELECT)
      .single()

    if (error) {
      throw new Error(`Erro ao criar profile: ${error.message}`)
    }

    return data as User
  }
}
