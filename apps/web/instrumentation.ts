/**
 * Next.js Instrumentation — Sentry server-side setup.
 * Loaded once when the Next.js server starts.
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Sentry server-side init — guarded by DSN env var.
    // If @sentry/nextjs is not installed, the dynamic import fails silently.
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      try {
        // @ts-expect-error — @sentry/nextjs is an optional peer dependency
        const Sentry = await import('@sentry/nextjs')
        Sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          environment: process.env.NODE_ENV,
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
          enabled:
            process.env.NODE_ENV === 'production' || process.env.SENTRY_FORCE_ENABLE === 'true',
        })
      } catch {
        // @sentry/nextjs not installed — skip silently
      }
    }
  }
}
