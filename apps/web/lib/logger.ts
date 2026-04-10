/**
 * Structured logger — JSON in production, console in development.
 * Integrates with Sentry when available.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  data?: Record<string, unknown>
  timestamp: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const MIN_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL]
}

function formatEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    return JSON.stringify(entry)
  }
  const prefix = `[${entry.context ?? 'app'}]`
  const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : ''
  return `${prefix} ${entry.message}${dataStr}`
}

function log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>) {
  if (!shouldLog(level)) return

  const entry: LogEntry = {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  }

  const formatted = formatEntry(entry)

  switch (level) {
    case 'debug':
      console.debug(formatted)
      break
    case 'info':
      console.info(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'error':
      console.error(formatted)
      break
  }
}

export const logger = {
  debug: (message: string, context?: string, data?: Record<string, unknown>) =>
    log('debug', message, context, data),
  info: (message: string, context?: string, data?: Record<string, unknown>) =>
    log('info', message, context, data),
  warn: (message: string, context?: string, data?: Record<string, unknown>) =>
    log('warn', message, context, data),
  error: (message: string, context?: string, data?: Record<string, unknown>) =>
    log('error', message, context, data),
}

// ============================================================================
// API Route Logging Wrapper
// ============================================================================

import type { NextRequest } from 'next/server'

type RouteHandler = (request: NextRequest, ...args: never[]) => Promise<Response>

/**
 * Wraps an API route handler with structured request/response logging.
 * Logs: method, path, status, duration_ms.
 */
export function withApiLog<T extends RouteHandler>(routeName: string, handler: T): T {
  const wrapped = async (request: NextRequest, ...args: never[]) => {
    const start = Date.now()
    const method = request.method
    const path = request.nextUrl.pathname
    try {
      const response = await handler(request, ...args)
      const duration = Date.now() - start
      const level = response.status >= 500 ? 'error' : response.status >= 400 ? 'warn' : 'info'
      log(level, `${method} ${path} ${response.status} ${duration}ms`, routeName, {
        method,
        path,
        status: response.status,
        duration_ms: duration,
      })
      return response
    } catch (err) {
      const duration = Date.now() - start
      log('error', `${method} ${path} UNHANDLED ${duration}ms`, routeName, {
        method,
        path,
        duration_ms: duration,
        error: err instanceof Error ? err.message : String(err),
      })
      throw err
    }
  }
  return wrapped as T
}
