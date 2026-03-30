/**
 * useToast — Sprint 26
 * Manages a queue of auto-dismissing toast notifications.
 * Use with ToastContainer to render them.
 */
import { useCallback, useState } from 'react'
import type { ToastItem, ToastSeverity } from '../components/common/Toast'

export interface UseToastReturn {
  toasts: ToastItem[]
  toast: (message: string, severity?: ToastSeverity, duration?: number) => void
  dismiss: (id: string) => void
  clearAll: () => void
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback(
    (message: string, severity: ToastSeverity = 'info', duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts(prev => [...prev, { id, message, severity, duration }])
    },
    []
  )

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearAll = useCallback(() => setToasts([]), [])

  return { toasts, toast, dismiss, clearAll }
}
