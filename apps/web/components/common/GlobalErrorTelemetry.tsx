'use client'

import { useEffect } from 'react'

/**
 * Captura errors client-side e envia para /api/telemetry/errors.
 *
 * 3 canais:
 *  1. window.error            → erros sincronos
 *  2. unhandledrejection      → promises rejeitadas
 *  3. console.error patch     → captura onRecoverableError do React 18
 *                               (hydration errors #418/#419/#421/#422/#423/#425),
 *                               incluindo componentStack desminificado.
 *                               React 18 NAO propaga esses erros para
 *                               window.error — so chegam via console.error.
 *
 * Dedup: mesmo kind + message + stack curto → não re-envia em 5s.
 */
export function GlobalErrorTelemetry() {
  useEffect(() => {
    const recent = new Map<string, number>()
    const DEDUP_MS = 5000

    function send(payload: {
      message: string
      stack?: string
      componentStack?: string
      source?: string
      line?: number
      column?: number
      kind: 'error' | 'unhandled_rejection' | 'hydration' | 'recoverable'
    }) {
      const key = `${payload.kind}|${payload.message}|${payload.stack?.slice(0, 80) ?? ''}`
      const now = Date.now()
      const last = recent.get(key)
      if (last && now - last < DEDUP_MS) return
      recent.set(key, now)

      try {
        const body = JSON.stringify({
          ...payload,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        })
        fetch('/api/telemetry/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {})
      } catch {
        /* ignore */
      }
    }

    // ── 1. window.error ────────────────────────────────────────────────
    const onError = (ev: ErrorEvent) => {
      const msg = ev.message || 'unknown error'
      const isHydration =
        /Minified React error #(418|419|421|422|423|425)/i.test(msg) ||
        /hydration|hydrating/i.test(msg)
      send({
        message: msg,
        stack: ev.error?.stack,
        source: ev.filename,
        line: ev.lineno,
        column: ev.colno,
        kind: isHydration ? 'hydration' : 'error',
      })
    }

    // ── 2. unhandledrejection ──────────────────────────────────────────
    const onRejection = (ev: PromiseRejectionEvent) => {
      const reason = ev.reason
      const message =
        reason instanceof Error ? reason.message : typeof reason === 'string' ? reason : 'unknown'
      send({
        message,
        stack: reason instanceof Error ? reason.stack : undefined,
        kind: 'unhandled_rejection',
      })
    }

    // ── 3. console.error patch ─────────────────────────────────────────
    // Capta mensagens que o React 18 loga ao recuperar hydration errors.
    // Formato tipico (prod-min):
    //   args[0] = "Error: Minified React error #418; visit https://..."
    //   args[1] = componentStack (string)
    // ou (dev):
    //   args[0] = "Warning: Text content did not match. Server: %s Client: %s"
    //   args[N] = componentStack
    // Preservamos o comportamento original do console.error.
    const originalConsoleError = console.error
    const HYDRATION_PATTERNS = [
      /Minified React error #(418|419|421|422|423|425)/i,
      /Hydration failed because/i,
      /There was an error while hydrating/i,
      /Text content does not match server-rendered HTML/i,
      /did not match\. Server:/i,
    ]

    console.error = function patchedConsoleError(...args: unknown[]) {
      try {
        const firstArg = args[0]
        const msgString =
          firstArg instanceof Error
            ? firstArg.message
            : typeof firstArg === 'string'
              ? firstArg
              : ''

        if (msgString && HYDRATION_PATTERNS.some(p => p.test(msgString))) {
          // Procura componentStack nos args — geralmente o ultimo arg string multi-linha com '\n    at '
          let componentStack: string | undefined
          for (let i = args.length - 1; i >= 0; i--) {
            const a = args[i]
            if (typeof a === 'string' && /\n\s+(at|in)\s/.test(a)) {
              componentStack = a
              break
            }
          }
          send({
            message: msgString.slice(0, 500),
            stack: firstArg instanceof Error ? firstArg.stack : undefined,
            componentStack,
            kind: 'recoverable',
          })
        }
      } catch {
        /* never let telemetry break console */
      }
      // Chama o original SEMPRE — nao engolir logs
      return originalConsoleError.apply(console, args)
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
      // Restaura console.error (caso o componente desmonte — SPA navigation)
      console.error = originalConsoleError
    }
  }, [])

  return null
}
