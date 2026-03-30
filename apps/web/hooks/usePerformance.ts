/**
 * Performance Hooks
 *
 * Sprint 19: Performance e Otimização
 * Provides prefetching, optimistic updates helpers, and Web Vitals monitoring.
 */

import React, { useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

// ============================================================================
// Types
// ============================================================================

export interface WebVitalsMetric {
  name: 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export interface PrefetchOptions {
  staleTime?: number
  enabled?: boolean
}

// ============================================================================
// Thresholds (Google Core Web Vitals)
// ============================================================================

const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
} as const

function getRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
  const t = THRESHOLDS[name]
  if (value <= t.good) return 'good'
  if (value <= t.poor) return 'needs-improvement'
  return 'poor'
}

// ============================================================================
// useWebVitals
// ============================================================================

export function useWebVitals(onMetric?: (metric: WebVitalsMetric) => void): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    const report = (name: WebVitalsMetric['name'], value: number) => {
      const metric: WebVitalsMetric = { name, value, rating: getRating(name, value) }
      onMetric?.(metric)
    }

    // LCP
    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
        report('LCP', last.startTime)
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {
      /* PerformanceObserver not supported */
    }

    // CLS
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const e = entry as PerformanceEntry & { hadRecentInput: boolean; value: number }
          if (!e.hadRecentInput) clsValue += e.value
        }
        report('CLS', clsValue)
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
    } catch {
      /* PerformanceObserver not supported */
    }

    // FCP
    try {
      const fcpObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            report('FCP', entry.startTime)
          }
        }
      })
      fcpObserver.observe({ type: 'paint', buffered: true })
    } catch {
      /* PerformanceObserver not supported */
    }

    // TTFB via navigation timing
    try {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (nav) {
        report('TTFB', nav.responseStart - nav.requestStart)
      }
    } catch {
      /* Navigation timing not available */
    }
  }, [onMetric])
}

// ============================================================================
// usePrefetchQuery
// ============================================================================

export function usePrefetchQuery() {
  const queryClient = useQueryClient()

  const prefetch = useCallback(
    <T>(queryKey: unknown[], queryFn: () => Promise<T>, options: PrefetchOptions = {}) => {
      const { staleTime = 30_000, enabled = true } = options
      if (!enabled) return

      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime,
      })
    },
    [queryClient]
  )

  return { prefetch }
}

// ============================================================================
// useIntersectionPrefetch
// ============================================================================

/**
 * Prefetches a query when an element enters the viewport.
 * Useful for "hover to prefetch" or "visible to prefetch" patterns.
 */
export function useIntersectionPrefetch<T>(
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  options: PrefetchOptions & { rootMargin?: string } = {}
) {
  const queryClient = useQueryClient()
  const ref = useRef<HTMLElement | null>(null)
  const { staleTime = 30_000, enabled = true, rootMargin = '100px' } = options

  useEffect(() => {
    if (!enabled || !ref.current) return
    if (!('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          queryClient.prefetchQuery({ queryKey, queryFn, staleTime })
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [queryClient, queryKey, queryFn, staleTime, enabled, rootMargin])

  return ref
}

// ============================================================================
// useDebounce
// ============================================================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// ============================================================================
// useThrottle
// ============================================================================

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value)
  const lastUpdated = useRef<number>(0)

  useEffect(() => {
    const now = Date.now()
    if (now - lastUpdated.current >= interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(
        () => {
          lastUpdated.current = Date.now()
          setThrottledValue(value)
        },
        interval - (now - lastUpdated.current)
      )
      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}

// ============================================================================
// useMeasureRender
// ============================================================================

/**
 * Measures component render time for performance profiling.
 * Returns render count and last render duration in ms.
 */
export function useMeasureRender(componentName: string) {
  const renderCount = useRef(0)
  const startTime = useRef(performance.now())

  renderCount.current += 1
  const renderDuration = performance.now() - startTime.current
  startTime.current = performance.now()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(
        `[Perf] ${componentName} render #${renderCount.current}: ${renderDuration.toFixed(2)}ms`
      )
    }
  })

  return { renderCount: renderCount.current, renderDuration }
}
