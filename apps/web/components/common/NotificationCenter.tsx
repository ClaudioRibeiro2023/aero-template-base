/**
 * NotificationCenter — Sprint P0-2 + Sprint 5 A11y
 * Bell icon dropdown with notification list and real-time updates.
 * A11y: Escape closes, Arrow Up/Down navigates, Enter/Space activates,
 *        textual severity labels alongside color dots.
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { Bell, Check, X, Trash2 } from 'lucide-react'
import { Tooltip } from '@template/design-system'
import { useKeyboardNavigation } from '@/hooks/useA11y'
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
  info: 'bg-[var(--brand-primary)]',
  success: 'bg-[var(--accent-emerald)]',
  warning: 'bg-[var(--accent-amber)]',
  error: 'bg-[var(--accent-rose)]',
}

const SEVERITY_LABEL: Record<string, string> = {
  info: 'Info',
  success: 'Sucesso',
  warning: 'Alerta',
  error: 'Erro',
}

const SEVERITY_TEXT_COLOR: Record<string, string> = {
  info: 'text-[var(--brand-primary)]',
  success: 'text-[var(--accent-emerald)]',
  warning: 'text-[var(--accent-amber)]',
  error: 'text-[var(--accent-rose)]',
}

export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onClear,
  compact = false,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Keyboard navigation for notification items
  const {
    activeIndex,
    setActiveIndex,
    handleKeyDown: navKeyDown,
    reset,
  } = useKeyboardNavigation(notifications.length, {
    loop: true,
    orientation: 'vertical',
    onEscape: () => {
      setIsOpen(false)
      reset()
    },
  })

  // Focus active item when activeIndex changes
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLElement>('[data-notification-item]')
      items[activeIndex]?.focus()
    }
  }, [activeIndex])

  // Reset active index when opening/closing
  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
        reset()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [reset])

  const handleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  // Handle Enter/Space on notification items
  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent, notif: Notification, _index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!notif.read) onMarkRead(notif.id)
        return
      }
      // Delegate arrow/escape/home/end to nav handler
      navKeyDown(e)
    },
    [navKeyDown, onMarkRead]
  )

  // Handle Escape on the dropdown container level
  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
        reset()
      }
    },
    [reset]
  )

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
      <Tooltip content="Notificações">
        <button
          onClick={handleOpen}
          className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors relative min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Bell size={compact ? 18 : 20} className="text-text-secondary" />
          {unreadCount > 0 && (
            <span
              className="absolute top-0.5 right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[var(--accent-rose)] text-white text-[9px] font-bold px-1"
              aria-hidden="true"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </Tooltip>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Centro de notificações"
          onKeyDown={handleContainerKeyDown}
          className="absolute right-0 top-full mt-1 w-80 max-h-[400px] rounded-[var(--radius-lg)] border border-white/[0.06] bg-[var(--glass-bg)] backdrop-blur-xl shadow-[var(--shadow-lg)] z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-text-primary">Notificações</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Tooltip content="Marcar todas como lidas" position="bottom">
                  <button
                    onClick={onMarkAllRead}
                    className="p-1 rounded hover:bg-white/[0.04] text-[var(--text-secondary)] text-xs min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label="Marcar todas como lidas"
                  >
                    <Check size={14} />
                  </button>
                </Tooltip>
              )}
              {notifications.length > 0 && (
                <Tooltip content="Limpar todas" position="bottom">
                  <button
                    onClick={onClear}
                    className="p-1 rounded hover:bg-white/[0.04] text-[var(--text-secondary)] text-xs min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label="Limpar todas as notificações"
                  >
                    <Trash2 size={14} />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>

          {/* List */}
          <div
            ref={listRef}
            role="list"
            aria-label="Lista de notificações"
            className="flex-1 overflow-y-auto"
          >
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                <Bell size={24} className="opacity-30 mb-2" aria-hidden="true" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={notif.id}
                  role="button"
                  tabIndex={0}
                  data-notification-item
                  aria-label={`${SEVERITY_LABEL[notif.severity]}: ${notif.title} — ${notif.message}`}
                  aria-pressed={notif.read}
                  className={clsx(
                    'flex items-start gap-2.5 px-3 py-2.5 border-b border-white/[0.06] last:border-0 transition-colors cursor-pointer',
                    'focus:outline-none focus:bg-white/[0.06]',
                    !notif.read && 'bg-brand-primary/5',
                    activeIndex === index && 'bg-white/[0.06]'
                  )}
                  onClick={() => !notif.read && onMarkRead(notif.id)}
                  onKeyDown={e => handleItemKeyDown(e, notif, index)}
                  onFocus={() => setActiveIndex(index)}
                >
                  <span
                    className={clsx(
                      'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                      SEVERITY_DOT[notif.severity]
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={clsx(
                          'text-[9px] font-semibold uppercase tracking-wider',
                          SEVERITY_TEXT_COLOR[notif.severity]
                        )}
                      >
                        {SEVERITY_LABEL[notif.severity]}
                      </span>
                    </div>
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
                    className="p-1 rounded text-text-muted hover:text-text-primary transition-colors flex-shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
                    aria-label={`Dispensar notificação: ${notif.title}`}
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
