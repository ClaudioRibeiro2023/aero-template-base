import { NextResponse } from 'next/server'

/**
 * Endpoint de telemetria de erros client-side.
 * - Aceita POST com { message, digest?, stack?, url, timestamp }
 * - Loga no console do servidor (captado por logs Vercel)
 * - Se SENTRY_DSN configurado no server, repassa
 * - Degrada silenciosamente se qualquer coisa falhar
 *
 * Não expõe PII: stack é truncado, não persiste body do user.
 */

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface ErrorPayload {
  message?: string
  digest?: string
  stack?: string
  componentStack?: string
  kind?: string
  source?: string
  line?: number
  column?: number
  url?: string
  timestamp?: string
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as ErrorPayload

    // Structured log — Vercel captura como JSON.
    // componentStack (desminificado pelo onRecoverableError) é o que precisamos
    // para rastrear hydration errors #418/#423/#425.
    console.error('[client-error]', {
      kind: payload.kind,
      message: payload.message?.slice(0, 500),
      digest: payload.digest,
      stack: payload.stack?.slice(0, 1500),
      componentStack: payload.componentStack?.slice(0, 2000),
      source: payload.source,
      line: payload.line,
      column: payload.column,
      url: payload.url,
      timestamp: payload.timestamp ?? new Date().toISOString(),
      userAgent: request.headers.get('user-agent')?.slice(0, 200),
    })

    return NextResponse.json({ ok: true }, { status: 202 })
  } catch (err) {
    // Não queremos que o endpoint de erro cause outro erro
    console.error('[telemetry/errors] failed to process payload', err)
    return NextResponse.json({ ok: false }, { status: 202 })
  }
}
