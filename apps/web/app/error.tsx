'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#09090b' }}
    >
      {/* Ambient gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 600px 400px at 50% 30%, rgba(251,113,133,0.06), transparent), radial-gradient(ellipse 500px 500px at 80% 80%, rgba(167,139,250,0.04), transparent)',
        }}
      />
      <div
        className="relative flex flex-col items-center gap-5 p-8 text-center max-w-md w-full"
        style={{
          background: 'rgba(24, 24, 27, 0.72)',
          backdropFilter: 'blur(12px) saturate(1.2)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 56,
            height: 56,
            background: 'rgba(251,113,133,0.10)',
          }}
        >
          <AlertTriangle size={28} style={{ color: '#fb7185' }} />
        </div>

        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Algo deu errado</h1>
          <p className="mt-1 text-sm text-zinc-500">Ocorreu um erro inesperado. Tente novamente.</p>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div
            className="w-full text-left p-3 rounded-lg overflow-auto max-h-32"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-xs text-zinc-500 font-mono leading-relaxed break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-[11px] text-zinc-600 font-mono mt-1">digest: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-1">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity duration-150 hover:opacity-90"
            style={{ background: '#00b4d8' }}
          >
            <RotateCcw size={14} />
            Tentar novamente
          </button>
          <a
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 transition-colors duration-150 hover:bg-white/[0.04]"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Home size={14} />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
