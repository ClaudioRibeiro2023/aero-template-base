'use client'

/**
 * useFeatureFlag — Verifica se uma feature flag está ativada
 *
 * Consulta Supabase real via API, com cache de 60s.
 * Fallback: retorna true se a flag não existir (feature habilitada por padrão).
 */

import { useQuery } from '@tanstack/react-query'

interface FeatureFlag {
  key: string
  enabled: boolean
  rollout_pct: number
}

async function fetchFlags(): Promise<FeatureFlag[]> {
  const res = await fetch('/api/feature-flags')
  if (!res.ok) return []
  const json = await res.json()
  return json.data ?? []
}

export function useFeatureFlag(key: string): boolean {
  const { data: flags = [] } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: fetchFlags,
    staleTime: 60 * 1000, // Cache 60s
  })

  const flag = flags.find(f => f.key === key)
  if (!flag) return true // Feature habilitada por padrão se flag não existir

  if (!flag.enabled) return false
  if (flag.rollout_pct >= 100) return true

  // Rollout percentual: usar hash do key para determinismo
  const hash = key.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return hash % 100 < flag.rollout_pct
}

export function useFeatureFlags(): { flags: FeatureFlag[]; isLoading: boolean } {
  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: fetchFlags,
    staleTime: 60 * 1000,
  })
  return { flags, isLoading }
}
