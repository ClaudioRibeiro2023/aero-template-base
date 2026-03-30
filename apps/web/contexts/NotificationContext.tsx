/**
 * NotificationContext — Sprint 26
 * Provides in-app notification state driven by WebSocket messages.
 */
import { createContext, useCallback, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  title: string
  body?: string
  severity: NotificationSeverity
  timestamp: string
  read: boolean
}

interface NotificationState {
  notifications: Notification[]
}

type NotificationAction =
  | { type: 'ADD'; notification: Notification }
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR_ALL' }

function reducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD':
      return { notifications: [action.notification, ...state.notifications] }
    case 'MARK_READ':
      return {
        notifications: state.notifications.map(n =>
          n.id === action.id ? { ...n, read: true } : n
        ),
      }
    case 'MARK_ALL_READ':
      return { notifications: state.notifications.map(n => ({ ...n, read: true })) }
    case 'REMOVE':
      return { notifications: state.notifications.filter(n => n.id !== action.id) }
    case 'CLEAR_ALL':
      return { notifications: [] }
    default:
      return state
  }
}

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  add: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  remove: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { notifications: [] })

  const add = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    dispatch({
      type: 'ADD',
      notification: {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        read: false,
      },
    })
  }, [])

  const markRead = useCallback((id: string) => dispatch({ type: 'MARK_READ', id }), [])
  const markAllRead = useCallback(() => dispatch({ type: 'MARK_ALL_READ' }), [])
  const remove = useCallback((id: string) => dispatch({ type: 'REMOVE', id }), [])
  const clearAll = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), [])

  const unreadCount = state.notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        unreadCount,
        add,
        markRead,
        markAllRead,
        remove,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}
