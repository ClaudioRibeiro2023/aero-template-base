/**
 * OrganizationRepository — Acesso a dados para organizations + organization_members.
 * Tabelas: organizations, organization_members
 */
import { SupabaseRepository } from '../providers/supabase/SupabaseRepository'
import type { SupabaseDbClient } from '../providers/supabase/SupabaseDbClient'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: string | null
  settings: Record<string, unknown>
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface OrganizationCreate {
  name: string
  slug: string
  plan?: string
  settings?: Record<string, unknown>
  logo_url?: string
}

export interface OrganizationUpdate {
  name?: string
  slug?: string
  plan?: string
  settings?: Record<string, unknown>
  logo_url?: string
}

const DEFAULT_SELECT = 'id, name, slug, plan, settings, logo_url, created_at, updated_at'

export class OrganizationRepository extends SupabaseRepository<
  Organization,
  OrganizationCreate,
  OrganizationUpdate
> {
  constructor(dbClient: SupabaseDbClient) {
    super(dbClient, {
      table: 'organizations',
      defaultSelect: DEFAULT_SELECT,
    })
  }

  /** Busca organizações das quais o usuário é membro */
  async findByMember(userId: string): Promise<Array<Organization & { memberRole: string }>> {
    const client = await this.getClient()
    const { data, error } = await client
      .from('organization_members')
      .select('org_id, role, organizations(id, name, slug, plan, settings, logo_url)')
      .eq('user_id', userId)

    if (error || !data) return []

    return data.map((row: Record<string, unknown>) => {
      const org = row.organizations as Record<string, unknown>
      return {
        id: org.id as string,
        name: org.name as string,
        slug: org.slug as string,
        plan: (org.plan as string) ?? null,
        settings: (org.settings as Record<string, unknown>) ?? {},
        logo_url: (org.logo_url as string) ?? null,
        created_at: '',
        updated_at: '',
        memberRole: row.role as string,
      }
    })
  }

  /** Busca organização por slug */
  async findBySlug(slug: string): Promise<Organization | null> {
    const client = await this.getClient()
    const { data, error } = await client
      .from('organizations')
      .select(DEFAULT_SELECT)
      .eq('slug', slug)
      .single()

    if (error) return null
    return data as Organization
  }
}
