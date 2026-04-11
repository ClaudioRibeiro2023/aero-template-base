'use client'

/**
 * useGlobalSearch — Hook de busca global para Command Palette
 *
 * Busca em paralelo: navegação (estática), usuários, tickets e tasks via React Query.
 * Debounce de 300ms para reduzir chamadas à API.
 */
import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigationConfig } from '@/hooks/useNavigationConfig'

export interface SearchResult {
  id: string
  type: 'navigation' | 'user' | 'ticket' | 'task'
  title: string
  description?: string
  path: string
  icon?: string
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timerRef.current)
  }, [value, delay])

  return debounced
}

async function searchApi(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  const params = new URLSearchParams({ q: query, limit: '8' })

  try {
    const res = await fetch(`/api/search?${params}`)
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query.trim(), 300)
  const { authorizedModules } = useNavigationConfig()

  // Static navigation results (no API call, client-only filter)
  const navResults = useMemo<SearchResult[]>(() => {
    if (!debouncedQuery || debouncedQuery.length < 1) return []
    const lower = debouncedQuery.toLowerCase()

    return authorizedModules
      .filter(
        m =>
          m.name.toLowerCase().includes(lower) ||
          m.path.toLowerCase().includes(lower) ||
          m.description?.toLowerCase().includes(lower)
      )
      .slice(0, 5)
      .map(m => ({
        id: `nav-${m.id}`,
        type: 'navigation' as const,
        title: m.name,
        description: m.description || m.path,
        path: m.path,
        icon: m.icon,
      }))
  }, [debouncedQuery, authorizedModules])

  // API search results (users, tickets, tasks)
  const {
    data: apiResults = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: () => searchApi(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 10 * 1000,
    placeholderData: previousData => previousData,
  })

  // Merge: navigation first, then API results
  const results = useMemo(() => {
    return [...navResults, ...apiResults]
  }, [navResults, apiResults])

  return {
    query,
    setQuery,
    results,
    isLoading: isLoading || isFetching,
    hasResults: results.length > 0,
    clear: () => setQuery(''),
  }
}
