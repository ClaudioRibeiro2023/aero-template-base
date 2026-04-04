'use client'

import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="page-enter ambient-gradient flex items-center justify-center min-h-[60vh] p-4">
      <div className="relative z-10 glass-panel p-8 max-w-md text-center space-y-4">
        <div className="p-3 rounded-2xl bg-rose-500/10 inline-flex mx-auto">
          <AlertTriangle size={28} className="text-rose-400" />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Erro inesperado</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Algo deu errado ao carregar esta página.
        </p>
        {error.digest && (
          <p className="text-xs text-[var(--text-muted)] font-mono">Código: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--glass-border)] text-sm text-[var(--text-secondary)] hover:bg-white/[0.04] transition-colors"
          >
            <Home size={14} />
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
