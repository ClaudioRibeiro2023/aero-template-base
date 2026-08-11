// Observability Module — Services placeholder.

import type { LogEntry, MetricPoint, HealthCheck } from '../types'

export async function listLogs(): Promise<LogEntry[]> {
  return []
}

export async function listMetrics(): Promise<MetricPoint[]> {
  return []
}

export async function listHealthChecks(): Promise<HealthCheck[]> {
  return []
}
