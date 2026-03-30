/**
 * ToastProvider — Global toast notification context
 * Provides addToast/removeToast to the entire app via React context.
 */
import { createContext, useCallback, useContext, useState } from 'react'
import { ToastContainer, type ToastItem, type ToastSeverity } from './Toast'

interface ToastContextValue {
  addToast: (message: string, severity?: ToastSeverity, duration?: number) => void
  removeToast: (id: string) => void
  toasts: ToastItem[]
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback(
    (message: string, severity: ToastSeverity = 'info', duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setToasts(prev => [...prev, { id, message, severity, duration }])
    },
    []
  )

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}
