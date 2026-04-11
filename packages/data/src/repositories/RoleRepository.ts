/**
 * RoleRepository — Acesso a dados para custom_roles.
 * Tabela: custom_roles
 */
import type { RoleDefinition, RoleCreate, RoleUpdate } from '@template/types'
import { SupabaseRepository } from '../providers/supabase/SupabaseRepository'
import type { SupabaseDbClient } from '../providers/supabase/SupabaseDbClient'

const DEFAULT_SELECT =
  'id, tenant_id, name, display_name, description, permissions, is_system, hierarchy_level, created_at, updated_at'

export class RoleRepository extends SupabaseRepository<RoleDefinition, RoleCreate, RoleUpdate> {
  constructor(dbClient: SupabaseDbClient) {
    super(dbClient, {
      table: 'custom_roles',
      defaultSelect: DEFAULT_SELECT,
    })
  }

  /** Busca roles ordenadas por hierarquia */
  async findAllOrdered() {
    return this.findMany({
      sort: [{ field: 'hierarchy_level', ascending: true }],
      pagination: { page: 1, pageSize: 100 },
    })
  }

  /** Busca role por nome (único por tenant) */
  async findByName(name: string): Promise<RoleDefinition | null> {
    const client = await this.getClient()
    const { data, error } = await client
      .from('custom_roles')
      .select(DEFAULT_SELECT)
      .eq('name', name)
      .single()

    if (error) return null
    return data as RoleDefinition
  }
}
