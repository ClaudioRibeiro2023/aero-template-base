'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App Error]', error)
    // To enable Sentry: install @sentry/nextjs and replace the line above with:
    // if (process.env.NODE_ENV === 'production') Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-base)]">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-red-600">Erro</h1>
        <p className="mt-4 text-[var(--text-secondary)]">Algo deu errado. Tente novamente.</p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <p className="mt-2 text-sm text-[var(--text-muted)] font-mono bg-[var(--surface-raised)] p-3 rounded">
            {error.message}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="px-6 py-2 rounded-lg bg-[var(--brand-primary)] text-white font-medium hover:opacity-90"
          >
            Tentar novamente
          </button>
          <a
            href="/dashboard"
            className="px-6 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] font-medium hover:bg-[var(--surface-raised)]"
          >
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
