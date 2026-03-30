import { env } from '@/lib/env'
/**
 * Sentry Integration (Ready to use)
 *
 * Para habilitar o Sentry:
 * 1. Instalar: pnpm --filter @template/web add @sentry/react
 * 2. Adicionar VITE_SENTRY_DSN ao .env
 * 3. Descomentar o código abaixo
 */
/* eslint-disable no-console */

// import * as Sentry from '@sentry/react'

export interface SentryConfig {
  dsn: string
  environment?: string
  release?: string
  tracesSampleRate?: number
}

/**
 * Initialize Sentry error tracking
 *
 * @example
 * ```ts
 * initSentry({
 *   dsn: env.SENTRY_DSN,
 *   environment: process.env.NODE_ENV,
 * })
 * ```
 */
export function initSentry(config: SentryConfig): void {
  const {
    dsn,
    environment = 'development',
    release: _release,
    tracesSampleRate: _tracesSampleRate = 0.1,
  } = config

  if (!dsn) {
    console.warn('[Sentry] DSN not configured, error tracking disabled')
    return
  }

  // Descomentar quando @sentry/react estiver instalado:
  /*
  Sentry.init({
    dsn,
    environment,
    release,
    tracesSampleRate,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Session Replay sample rate
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
  */

  console.info(`[Sentry] Initialized for ${environment}`)
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  // Descomentar quando @sentry/react estiver instalado:
  // Sentry.captureException(error, { extra: context })

  console.error('[Sentry] Would capture:', error, context)
}

/**
 * Capture a message manually
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  // Descomentar quando @sentry/react estiver instalado:
  // Sentry.captureMessage(message, level)

  console.log(`[Sentry] Would capture message (${level}):`, message)
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  // Descomentar quando @sentry/react estiver instalado:
  // Sentry.setUser(user)

  console.log('[Sentry] Would set user:', user)
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  category?: string
  message: string
  level?: 'debug' | 'info' | 'warning' | 'error'
  data?: Record<string, unknown>
}): void {
  // Descomentar quando @sentry/react estiver instalado:
  // Sentry.addBreadcrumb(breadcrumb)

  console.log('[Sentry] Would add breadcrumb:', breadcrumb)
}

/**
 * Sentry Error Boundary wrapper (ready to use)
 *
 * Descomentar quando @sentry/react estiver instalado:
 * export const SentryErrorBoundary = Sentry.ErrorBoundary
 */
export const SentryErrorBoundary = null // Placeholder

/**
 * Check if Sentry is enabled
 */
export function isSentryEnabled(): boolean {
  return !!env.SENTRY_DSN
}
