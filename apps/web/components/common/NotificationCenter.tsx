/**
 * NotificationCenter — Sprint P0-2
 * Bell icon dropdown with notification list and real-time updates.
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { Bell, Check, X, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from '@template/design-system'
import clsx from 'clsx'

export interface Notification {
  id: string
  title: string
  message: string
  severity: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  timestamp: Date
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onDismiss: (id: string) => void
  onClear: () => void
  compact?: boolean
}

const SEVERITY_DOT: Record<string, string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}

export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onClear,
  compact = false,
}: NotificationCenterProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'agora'
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}d`
  }

  return (
    <div ref={ref} className="relative">
      <Tooltip content={t('notifications.title')}>
        <button
          onClick={handleOpen}
          className="p-2 rounded-lg hover:bg-surface-muted transition-colors relative"
          aria-label={t('notifications.title')}
        >
          <Bell size={compact ? 18 : 20} className="text-text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </Tooltip>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 max-h-[400px] rounded-lg border border-border-default bg-surface-elevated shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-default">
            <h3 className="text-sm font-semibold text-text-primary">{t('notifications.title')}</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Tooltip content={t('notifications.markAllRead')} position="bottom">
                  <button
                    onClick={onMarkAllRead}
                    className="p-1 rounded hover:bg-surface-muted text-text-secondary text-xs"
                  >
                    <Check size={14} />
                  </button>
                </Tooltip>
              )}
              {notifications.length > 0 && (
                <Tooltip content="Limpar todas" position="bottom">
                  <button
                    onClick={onClear}
                    className="p-1 rounded hover:bg-surface-muted text-text-secondary text-xs"
                  >
                    <Trash2 size={14} />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                <Bell size={24} className="opacity-30 mb-2" />
                <p className="text-sm">{t('notifications.empty')}</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={clsx(
                    'flex items-start gap-2.5 px-3 py-2.5 border-b border-border-default last:border-0 transition-colors',
                    !notif.read && 'bg-brand-primary/5'
                  )}
                  onClick={() => !notif.read && onMarkRead(notif.id)}
                >
                  <span
                    className={clsx(
                      'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                      SEVERITY_DOT[notif.severity]
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{notif.title}</p>
                    <p className="text-[11px] text-text-secondary line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-text-muted mt-0.5 block">
                      {formatTime(notif.timestamp)}
                    </span>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onDismiss(notif.id)
                    }}
                    className="p-0.5 rounded text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
