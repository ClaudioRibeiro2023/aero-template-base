/**
 * AuditLogRepository — Acesso a dados para audit_logs (somente leitura + insert).
 * Tabela: audit_logs
 *
 * Nota: audit_logs é imutável — sem update ou delete.
 */
import type { AuditLog } from '@template/types'
import { SupabaseRepository } from '../providers/supabase/SupabaseRepository'
import type { SupabaseDbClient } from '../providers/supabase/SupabaseDbClient'
import type { PaginatedResult, QueryOptions } from '../interfaces/IRepository'

export interface AuditLogCreate {
  user_id: string
  action: string
  resource: string
  resource_id?: string
  details?: Record<string, unknown>
  ip_address?: string
}

const DEFAULT_SELECT = 'id, user_id, action, resource, resource_id, ip_address, created_at'

export class AuditLogRepository extends SupabaseRepository<AuditLog, AuditLogCreate, never> {
  constructor(dbClient: SupabaseDbClient) {
    super(dbClient, {
      table: 'audit_logs',
      defaultSelect: DEFAULT_SELECT,
    })
  }

  /**
   * Override: audit_logs é imutável — update e delete lançam erro.
   */
  async update(): Promise<AuditLog | null> {
    throw new Error('audit_logs é imutável — update não permitido')
  }

  async delete(): Promise<boolean> {
    throw new Error('audit_logs é imutável — delete não permitido')
  }

  /**
   * Busca logs com filtros avançados (resource por ilike, date range).
   * Fallback gracioso se tabela não existir.
   */
  async findManyGraceful(options?: QueryOptions): Promise<PaginatedResult<AuditLog>> {
    try {
      return await this.findMany(options)
    } catch {
      // Tabela pode não existir em ambientes de dev
      return { data: [], total: 0, page: 1, pageSize: 20, pages: 0 }
    }
  }
}
