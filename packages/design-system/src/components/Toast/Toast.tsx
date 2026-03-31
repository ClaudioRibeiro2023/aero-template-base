/**
 * Toast Component
 *
 * Sistema de notificações toast com diferentes tipos e auto-dismiss.
 */

import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import clsx from 'clsx'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center'

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number
}

export interface ToastProps extends Toast {
  onClose: () => void
}

const ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

export function ToastItem({ id: _id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const Icon = ICONS[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(onClose, 200)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 200)
  }

  return (
    <div
      className={clsx('ds-toast', `ds-toast--${type}`, isExiting && 'ds-toast--exiting')}
      role="alert"
      aria-live="polite"
    >
      <div className="ds-toast__icon">
        <Icon size={20} />
      </div>
      <div className="ds-toast__content">
        {title && <div className="ds-toast__title">{title}</div>}
        <div className="ds-toast__message">{message}</div>
      </div>
      <button
        type="button"
        onClick={handleClose}
        className="ds-toast__close"
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
      {duration > 0 && (
        <div
          className="ds-toast__progress"
          style={{ animationDuration: `${duration}ms` }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

// Toast Container
interface ToastContainerProps {
  toasts: Toast[]
  position?: ToastPosition
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, position = 'top-right', onRemove }: ToastContainerProps) {
  return (
    <div className={clsx('ds-toast-container', `ds-toast-container--${position}`)}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  )
}

// Toast Context & Provider
interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  success: (message: string, title?: string) => string
  error: (message: string, title?: string) => string
  warning: (message: string, title?: string) => string
  info: (message: string, title?: string) => string
}

const ToastContext = createContext<ToastContextValue | null>(null)

interface ToastProviderProps {
  children: ReactNode
  position?: ToastPosition
  maxToasts?: number
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setToasts(prev => {
        const newToasts = [...prev, { ...toast, id }]
        return newToasts.slice(-maxToasts)
      })
      return id
    },
    [maxToasts]
  )

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback(
    (message: string, title?: string) => addToast({ type: 'success', message, title }),
    [addToast]
  )

  const error = useCallback(
    (message: string, title?: string) => addToast({ type: 'error', message, title }),
    [addToast]
  )

  const warning = useCallback(
    (message: string, title?: string) => addToast({ type: 'warning', message, title }),
    [addToast]
  )

  const info = useCallback(
    (message: string, title?: string) => addToast({ type: 'info', message, title }),
    [addToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastItem
