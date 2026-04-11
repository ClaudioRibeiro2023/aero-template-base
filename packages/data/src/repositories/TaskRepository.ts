/**
 * TaskRepository — Acesso a dados para tasks.
 * Tabela: tasks
 */
import type { Task } from '@template/types'
import { SupabaseRepository } from '../providers/supabase/SupabaseRepository'
import type { SupabaseDbClient } from '../providers/supabase/SupabaseDbClient'

export interface TaskCreate {
  title: string
  description?: string
  status?: string
  priority?: string
  assignee_id?: string | null
  created_by: string
}

export interface TaskUpdate {
  title?: string
  description?: string
  status?: string
  priority?: string
  assignee_id?: string | null
}

const DEFAULT_SELECT =
  'id, title, description, status, priority, assignee_id, created_by, tenant_id, created_at, updated_at'

export class TaskRepository extends SupabaseRepository<Task, TaskCreate, TaskUpdate> {
  constructor(dbClient: SupabaseDbClient) {
    super(dbClient, {
      table: 'tasks',
      defaultSelect: DEFAULT_SELECT,
    })
  }

  /** Busca tasks atribuídas a um usuário específico */
  async findByAssignee(assigneeId: string) {
    return this.findMany({
      filters: [{ field: 'assignee_id', operator: 'eq', value: assigneeId }],
      sort: [{ field: 'updated_at', ascending: false }],
    })
  }

  /** Busca tasks criadas por um usuário */
  async findByCreator(userId: string) {
    return this.findMany({
      filters: [{ field: 'created_by', operator: 'eq', value: userId }],
      sort: [{ field: 'updated_at', ascending: false }],
    })
  }
}
