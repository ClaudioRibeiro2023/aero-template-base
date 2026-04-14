'use client'

/**
 * Root error boundary — catches errors in the root layout.
 * MUST include <html> and <body> tags (Next.js requirement).
 * Uses inline styles because CSS vars / globals may not be available.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Log to console — Sentry's global error handler captures this automatically
  // if installed. Direct import avoided because @sentry/nextjs is optional.
  if (typeof window !== 'undefined') {
    console.error('[global-error]', error)
  }

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: 'linear-gradient(135deg, #0c1929 0%, #0f2940 50%, #0c1929 100%)',
          color: '#fff',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            padding: 48,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            ⚠️
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Erro inesperado</h1>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Ocorreu um erro crítico na aplicação. Tente novamente ou volte para o início.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.25)',
                marginBottom: 24,
                fontFamily: 'monospace',
              }}
            >
              Digest: {error.digest}
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: 'none',
                background: '#0087A8',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
            <a
              href="/dashboard"
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Ir ao Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
