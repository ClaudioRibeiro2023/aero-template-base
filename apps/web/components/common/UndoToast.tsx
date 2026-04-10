'use client'

import { RotateCcw, X } from 'lucide-react'

interface UndoToastProps {
  message: string
  countdown: number
  isPending: boolean
  onUndo: () => void
  onDismiss: () => void
}

export function UndoToast({ message, countdown, isPending, onUndo, onDismiss }: UndoToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(24,24,27,0.96)] backdrop-blur-lg text-sm animate-page-enter"
    >
      <span className="text-[var(--text-primary)] flex-1">{message}</span>

      <button
        onClick={onUndo}
        disabled={isPending}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors disabled:opacity-50"
      >
        <RotateCcw size={12} aria-hidden="true" />
        Desfazer ({countdown}s)
      </button>

      <button
        onClick={onDismiss}
        className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
        aria-label="Fechar"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  )
}
