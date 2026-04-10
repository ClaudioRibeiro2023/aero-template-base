'use client'

import { Loader2 } from 'lucide-react'

export function DiagnosticRunner({
  isRunning,
  currentCategory,
}: {
  isRunning: boolean
  currentCategory?: string
}) {
  if (!isRunning) return null

  return (
    <div className="glass-panel p-4 flex items-center gap-3">
      <Loader2 size={18} className="animate-spin text-[var(--brand-primary)]" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">Executando diagnóstico...</p>
        {currentCategory && (
          <p className="text-xs text-[var(--text-muted)]">Analisando: {currentCategory}</p>
        )}
      </div>
      <div className="h-1.5 flex-1 max-w-[200px] bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--brand-primary)] rounded-full animate-pulse"
          style={{ width: '60%' }}
        />
      </div>
    </div>
  )
}
