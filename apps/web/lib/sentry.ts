/**
 * Sentry integration — optional, only active when NEXT_PUBLIC_SENTRY_DSN is set.
 *
 * To enable:
 * 1. `pnpm add @sentry/nextjs` in apps/web
 * 2. Set NEXT_PUBLIC_SENTRY_DSN in .env
 * 3. Import and call initSentry() in providers.tsx
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sentryModule: any = null
let initialized = false

export async function initSentry() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return
  if (initialized) return

  try {
    const pkg = '@sentry/nextjs'
    sentryModule = await import(/* @vite-ignore */ pkg)
    sentryModule.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_FORCE_ENABLE === 'true',
    })
    initialized = true
  } catch {
    // @sentry/nextjs not installed — silently skip
    console.debug('[sentry] @sentry/nextjs not installed, skipping initialization')
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (sentryModule?.captureException) {
    sentryModule.captureException(error, context ? { extra: context } : undefined)
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (sentryModule?.captureMessage) {
    sentryModule.captureMessage(message, level)
  }
}
