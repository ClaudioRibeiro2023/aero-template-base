// Observability Module Types — placeholder mínimo.

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  traceId?: string
  userId?: string
}

export interface MetricPoint {
  name: string
  value: number
  timestamp: string
  labels?: Record<string, string>
}

export interface HealthCheck {
  id: string
  service: string
  status: 'up' | 'degraded' | 'down'
  checkedAt: string
  latencyMs?: number
}
