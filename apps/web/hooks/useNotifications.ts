/**
 * useNotifications — Sprint P0-2
 * Manages notification state and wires WebSocket events to the notification center.
 */
import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@template/shared'
import { useWebSocket, type WSMessage } from './useWebSocket'
import type { Notification } from '@/components/common/NotificationCenter'

const STORAGE_KEY = 'notifications'
const MAX_NOTIFICATIONS = 50

function loadNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored) as Notification[]
    return parsed.map(n => ({ ...n, timestamp: new Date(n.timestamp) }))
  } catch {
    return []
  }
}

function saveNotifications(notifications: Notification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)))
  } catch {
    // localStorage full
  }
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications)

  const addNotification = useCallback(
    (title: string, message: string, severity: Notification['severity'] = 'info') => {
      const notif: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        message,
        severity,
        read: false,
        timestamp: new Date(),
      }
      setNotifications(prev => {
        const updated = [notif, ...prev].slice(0, MAX_NOTIFICATIONS)
        saveNotifications(updated)
        return updated
      })
      return notif
    },
    []
  )

  const markRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, read: true } : n))
      saveNotifications(updated)
      return updated
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }))
      saveNotifications(updated)
      return updated
    })
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id)
      saveNotifications(updated)
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    saveNotifications([])
  }, [])

  // Wire WebSocket messages to notifications
  const handleWSMessage = useCallback(
    (msg: WSMessage) => {
      if (msg.type === 'notification' || msg.type === 'alert') {
        const payload = msg.payload || {}
        addNotification(
          (payload.title as string) || (msg.type === 'alert' ? 'Alerta' : 'Notificação'),
          (payload.message as string) || '',
          (payload.severity as Notification['severity']) ||
            (msg.type === 'alert' ? 'warning' : 'info')
        )
      }
    },
    [addNotification]
  )

  const ws = useWebSocket(user?.id || null, {
    autoConnect: !!user?.id,
    autoReconnect: true,
    onMessage: handleWSMessage,
  })

  // Persist when notifications change
  useEffect(() => {
    saveNotifications(notifications)
  }, [notifications])

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    addNotification,
    markRead,
    markAllRead,
    dismiss,
    clearAll,
    wsStatus: ws.status,
  }
}
