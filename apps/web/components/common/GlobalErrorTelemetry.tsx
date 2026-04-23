'use client'

import { useEffect } from 'react'

/**
 * Captura window.error + unhandledrejection e envia para /api/telemetry/errors.
 * Útil para diagnosticar React hydration errors (#418/#423/#425) em produção,
 * onde os nomes minificados tornam o console inútil.
 *
 * Dedup: mesmo message + mesmo stack curto → não re-envia em 5s.
 */
export function GlobalErrorTelemetry() {
  useEffect(() => {
    const recent = new Map<string, number>()
    const DEDUP_MS = 5000

    function send(payload: {
      message: string
      stack?: string
      source?: string
      line?: number
      column?: number
      kind: 'error' | 'unhandled_rejection' | 'hydration'
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

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}
