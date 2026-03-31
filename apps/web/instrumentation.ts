/**
 * Next.js Instrumentation — Sentry server-side setup.
 * Loaded once when the Next.js server starts.
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only import Sentry in Node.js runtime (not Edge)
    // To enable Sentry:
    // 1. pnpm add @sentry/nextjs
    // 2. Set NEXT_PUBLIC_SENTRY_DSN in your environment
    // 3. Uncomment the block below:
    //
    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   const Sentry = await import('@sentry/nextjs')
    //   Sentry.init({
    //     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    //     environment: process.env.NODE_ENV,
    //     tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    //     enabled: process.env.NODE_ENV === 'production' || process.env.SENTRY_FORCE_ENABLE === 'true',
    //   })
    // }
  }
}
