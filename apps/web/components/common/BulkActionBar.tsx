'use client'

import { type ReactNode } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

export interface BulkAction {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'primary' | 'danger' | 'secondary'
  disabled?: boolean
}

export interface BulkActionBarProps {
  selectedCount: number
  actions: BulkAction[]
  onClear: () => void
}

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90',
  danger: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20',
  secondary:
    'border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:bg-white/[0.04]',
}

export function BulkActionBar({ selectedCount, actions, onClear }: BulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(24,24,27,0.95)] backdrop-blur-lg animate-page-enter"
      role="toolbar"
      aria-label={`${selectedCount} itens selecionados`}
    >
      <span className="text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
        {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
      </span>

      <div className="w-px h-5 bg-[rgba(255,255,255,0.08)]" />

      {actions.map(action => (
        <button
          key={action.label}
          onClick={action.onClick}
          disabled={action.disabled}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[36px] disabled:opacity-40',
            VARIANT_CLASSES[action.variant || 'secondary']
          )}
        >
          {action.icon}
          {action.label}
        </button>
      ))}

      <button
        onClick={onClear}
        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.04] transition-colors"
        aria-label="Limpar seleção"
      >
        <X size={14} />
      </button>
    </div>
  )
}
