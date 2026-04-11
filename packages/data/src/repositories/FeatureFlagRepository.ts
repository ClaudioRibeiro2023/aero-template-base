/**
 * FeatureFlagRepository — Acesso a dados para feature_flags.
 * Tabela: feature_flags
 */
import type { FeatureFlag, FeatureFlagCreate, FeatureFlagUpdate } from '@template/types'
import { SupabaseRepository } from '../providers/supabase/SupabaseRepository'
import type { SupabaseDbClient } from '../providers/supabase/SupabaseDbClient'

const DEFAULT_SELECT =
  'id, tenant_id, flag_name, description, enabled, rollout_pct, created_at, updated_at'

export class FeatureFlagRepository extends SupabaseRepository<
  FeatureFlag,
  FeatureFlagCreate,
  FeatureFlagUpdate
> {
  constructor(dbClient: SupabaseDbClient) {
    super(dbClient, {
      table: 'feature_flags',
      defaultSelect: DEFAULT_SELECT,
    })
  }

  /** Busca flag pelo nome */
  async findByName(flagName: string): Promise<FeatureFlag | null> {
    const client = await this.getClient()
    const { data, error } = await client
      .from('feature_flags')
      .select(DEFAULT_SELECT)
      .eq('flag_name', flagName)
      .single()

    if (error) return null
    return data as FeatureFlag
  }

  /** Busca todas as flags habilitadas */
  async findEnabled() {
    return this.findMany({
      filters: [{ field: 'enabled', operator: 'eq', value: true }],
      sort: [{ field: 'flag_name', ascending: true }],
      pagination: { page: 1, pageSize: 200 },
    })
  }
}
