/**
 * NotificationRepository — Acesso a dados para notifications.
 * Tabela: notifications
 */
import { SupabaseRepository } from '../providers/supabase/SupabaseRepository'
import type { SupabaseDbClient } from '../providers/supabase/SupabaseDbClient'

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  severity: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

export interface NotificationCreate {
  user_id: string
  title: string
  message: string
  severity: 'info' | 'success' | 'warning' | 'error'
}

export interface NotificationUpdate {
  read?: boolean
}

const DEFAULT_SELECT = 'id, user_id, title, message, severity, read, created_at'

export class NotificationRepository extends SupabaseRepository<
  Notification,
  NotificationCreate,
  NotificationUpdate
> {
  constructor(dbClient: SupabaseDbClient) {
    super(dbClient, {
      table: 'notifications',
      defaultSelect: DEFAULT_SELECT,
    })
  }

  /** Busca notificações de um usuário, mais recentes primeiro (máx 50) */
  async findByUser(userId: string) {
    return this.findMany({
      filters: [{ field: 'user_id', operator: 'eq', value: userId }],
      sort: [{ field: 'created_at', ascending: false }],
      pagination: { page: 1, pageSize: 50 },
    })
  }

  /** Busca notificações não lidas do usuário */
  async findUnreadByUser(userId: string) {
    return this.findMany({
      filters: [
        { field: 'user_id', operator: 'eq', value: userId },
        { field: 'read', operator: 'eq', value: false },
      ],
      sort: [{ field: 'created_at', ascending: false }],
      pagination: { page: 1, pageSize: 50 },
    })
  }

  /** Marca todas as notificações do usuário como lidas */
  async markAllReadByUser(userId: string): Promise<void> {
    const client = await this.getClient()
    await client
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
  }
}
