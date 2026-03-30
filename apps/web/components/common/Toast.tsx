/**
 * Toast & ToastContainer — Sprint 26
 * Lightweight auto-dismissing toast notifications.
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type ToastSeverity = 'info' | 'success' | 'warning' | 'error'

export interface ToastItem {
  id: string
  message: string
  severity: ToastSeverity
  duration?: number
}

const SEVERITY_CLASSES: Record<ToastSeverity, string> = {
  info: 'bg-blue-600 text-white',
  success: 'bg-green-600 text-white',
  warning: 'bg-yellow-500 text-white',
  error: 'bg-red-600 text-white',
}

const SEVERITY_ICONS: Record<ToastSeverity, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
}

interface ToastProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const enter = requestAnimationFrame(() => setVisible(true))

    const duration = toast.duration ?? 4000
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, duration)

    return () => {
      cancelAnimationFrame(enter)
      clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div
      role="alert"
      aria-live="polite"
      data-testid="toast"
      className={[
        'flex items-start gap-2 min-w-[280px] max-w-sm px-4 py-3 rounded-lg shadow-lg text-sm',
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        SEVERITY_CLASSES[toast.severity],
      ].join(' ')}
    >
      <span aria-hidden className="mt-0.5 font-bold text-base leading-none">
        {SEVERITY_ICONS[toast.severity]}
      </span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Fechar notificação"
        className="ml-2 opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white rounded"
      >
        ✕
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return createPortal(
    <div
      aria-label="Notificações"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end"
      data-testid="toast-container"
    >
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  )
}

export type { ToastContainerProps }
