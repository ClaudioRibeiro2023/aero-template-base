import { env } from '@/lib/env'
import { useState, useEffect, useCallback } from 'react'

export interface HealthStatus {
  api: 'healthy' | 'unhealthy' | 'checking'
  lastChecked: Date | null
  latencyMs: number | null
  error: string | null
}

export interface UseHealthCheckOptions {
  /** API base URL (defaults to VITE_API_URL) */
  apiUrl?: string
  /** Check interval in ms (default: 30000 = 30s) */
  interval?: number
  /** Enable automatic periodic checks */
  enabled?: boolean
}

/**
 * Hook for checking API health status
 *
 * @example
 * ```tsx
 * const { status, check, isHealthy } = useHealthCheck()
 *
 * if (!isHealthy) {
 *   return <Banner type="warning">API is not available</Banner>
 * }
 * ```
 */
export function useHealthCheck(options: UseHealthCheckOptions = {}) {
  const {
    apiUrl = env.API_URL || 'http://localhost:8000',
    interval = 30000,
    enabled = true,
  } = options

  const [status, setStatus] = useState<HealthStatus>({
    api: 'checking',
    lastChecked: null,
    latencyMs: null,
    error: null,
  })

  const check = useCallback(async () => {
    const startTime = performance.now()

    try {
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        // Short timeout for health checks
        signal: AbortSignal.timeout(5000),
      })

      const latencyMs = Math.round(performance.now() - startTime)

      if (response.ok) {
        setStatus({
          api: 'healthy',
          lastChecked: new Date(),
          latencyMs,
          error: null,
        })
      } else {
        setStatus({
          api: 'unhealthy',
          lastChecked: new Date(),
          latencyMs,
          error: `HTTP ${response.status}: ${response.statusText}`,
        })
      }
    } catch (error) {
      const latencyMs = Math.round(performance.now() - startTime)
      setStatus({
        api: 'unhealthy',
        lastChecked: new Date(),
        latencyMs,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [apiUrl])

  // Initial check and interval
  useEffect(() => {
    if (!enabled) return

    // Initial check
    check()

    // Periodic checks
    const intervalId = setInterval(check, interval)

    return () => clearInterval(intervalId)
  }, [check, interval, enabled])

  return {
    status,
    check,
    isHealthy: status.api === 'healthy',
    isChecking: status.api === 'checking',
  }
}
