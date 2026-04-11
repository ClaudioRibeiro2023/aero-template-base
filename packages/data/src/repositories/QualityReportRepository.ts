/**
 * QualityReportRepository — Acesso a dados para quality_reports.
 * Tabela: quality_reports
 */
import { SupabaseRepository } from '../providers/supabase/SupabaseRepository'
import type { SupabaseDbClient } from '../providers/supabase/SupabaseDbClient'

export interface QualityReport {
  id: string
  overall_score: number
  results: Record<string, unknown>
  created_by: string
  created_at: string
}

export interface QualityReportCreate {
  overall_score: number
  results: Record<string, unknown>
  created_by: string
}

const DEFAULT_SELECT = 'id, overall_score, results, created_by, created_at'

export class QualityReportRepository extends SupabaseRepository<
  QualityReport,
  QualityReportCreate,
  Partial<QualityReport>
> {
  constructor(dbClient: SupabaseDbClient) {
    super(dbClient, {
      table: 'quality_reports',
      defaultSelect: DEFAULT_SELECT,
    })
  }

  /** Busca relatórios do usuário, mais recentes primeiro */
  async findByCreator(userId: string) {
    return this.findMany({
      filters: [{ field: 'created_by', operator: 'eq', value: userId }],
      sort: [{ field: 'created_at', ascending: false }],
    })
  }
}
