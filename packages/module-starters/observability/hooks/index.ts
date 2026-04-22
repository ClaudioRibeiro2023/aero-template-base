'use client'
import { useState, useEffect, useCallback } from 'react'

export function useHealth() {
  const [health, setHealth] = useState<{ status: string; services: Record<string, string> } | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(() => {
    setIsLoading(true)
    fetch('/api/observability?view=health')
      .then(r => r.json())
      .then(d => setHealth(d.data))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])
  return { health, isLoading, refresh }
}

export function useMetrics(period = '24h') {
  const [metrics, setMetrics] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/observability?view=metrics&period=${period}`)
      .then(r => r.json())
      .then(d => setMetrics(d.data?.metrics ?? {}))
      .finally(() => setIsLoading(false))
  }, [period])

  return { metrics, isLoading }
}

export function useLogs(limit = 100) {
  const [logs, setLogs] = useState<unknown[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/observability?view=logs&limit=${limit}`)
      .then(r => r.json())
      .then(d => setLogs(d.data?.logs ?? []))
      .finally(() => setIsLoading(false))
  }, [limit])

  return { logs, isLoading }
}
