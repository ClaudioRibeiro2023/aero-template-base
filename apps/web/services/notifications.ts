/**
 * Notifications Service — CRUD para notificações in-app
 *
 * Usado para notificações de bulk operations, alertas do sistema, etc.
 */
/**
 * Notifications Service — CRUD para notificações in-app
 *
 * Usado para notificações de bulk operations, alertas do sistema, etc.
 */
export interface AppNotification {
  id: string
  user_id: string
  title: string
  message: string
  severity: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const notificationsService = {
  list: async (): Promise<AppNotification[]> => {
    const res = await fetchApi<{ data: AppNotification[] }>('/api/notifications')
    return res.data
  },

  markRead: async (id: string): Promise<void> => {
    await fetchApi(`/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    })
  },

  markAllRead: async (): Promise<void> => {
    await fetchApi('/api/notifications/mark-all-read', { method: 'POST' })
  },

  dismiss: async (id: string): Promise<void> => {
    await fetchApi(`/api/notifications/${id}`, { method: 'DELETE' })
  },

  clearAll: async (): Promise<void> => {
    await fetchApi('/api/notifications/clear', { method: 'POST' })
  },

  create: async (data: {
    title: string
    message: string
    severity: 'info' | 'success' | 'warning' | 'error'
  }): Promise<AppNotification> => {
    return fetchApi<AppNotification>('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },
}
