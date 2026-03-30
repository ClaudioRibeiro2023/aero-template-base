/**
 * useFilters Hook
 *
 * Gerencia o estado global de filtros da aplicação.
 * - Armazena valores de filtros ativos
 * - Sincroniza com URL (query params)
 * - Persiste no localStorage
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { FilterConfig } from '@/config/navigation-schema'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type FilterValue = string | string[] | number | boolean | Date | [Date, Date] | null

export interface ActiveFilter {
  id: string
  value: FilterValue
}

export interface UseFiltersReturn {
  /** Valores atuais dos filtros */
  values: Record<string, FilterValue>

  /** Filtros ativos (com valor não-nulo) */
  activeFilters: ActiveFilter[]

  /** Quantidade de filtros ativos */
  activeCount: number

  /** Obter valor de um filtro */
  getValue: (filterId: string) => FilterValue

  /** Definir valor de um filtro */
  setValue: (filterId: string, value: FilterValue) => void

  /** Limpar um filtro específico */
  clearFilter: (filterId: string) => void

  /** Limpar todos os filtros */
  clearAll: () => void

  /** Verificar se um filtro está ativo */
  isActive: (filterId: string) => boolean

  /** Aplicar filtros (callback para componentes) */
  applyFilters: (newValues: Record<string, FilterValue>) => void
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'app-filters'
const URL_PARAM_PREFIX = 'f_'

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function serializeFilterValue(value: FilterValue): string | null {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) {
    if (value.length === 0) return null
    if (value[0] instanceof Date) {
      return `date:${(value as [Date, Date]).map(d => d.toISOString()).join(',')}`
    }
    return value.join(',')
  }
  if (value instanceof Date) {
    return `date:${value.toISOString()}`
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  return String(value)
}

function deserializeFilterValue(str: string | null): FilterValue {
  if (!str) return null

  // Date range
  if (str.startsWith('date:')) {
    const dateStr = str.slice(5)
    if (dateStr.includes(',')) {
      const [start, end] = dateStr.split(',')
      return [new Date(start), new Date(end)]
    }
    return new Date(dateStr)
  }

  // Boolean
  if (str === 'true') return true
  if (str === 'false') return false

  // Number
  if (!isNaN(Number(str)) && str.trim() !== '') {
    return Number(str)
  }

  // Array
  if (str.includes(',')) {
    return str.split(',')
  }

  return str
}

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useFilters(availableFilters?: FilterConfig[]): UseFiltersReturn {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentPath = usePathname()

  // Inicializar valores dos filtros
  const [values, setValues] = useState<Record<string, FilterValue>>(() => {
    const initial: Record<string, FilterValue> = {}

    // Carregar do localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        Object.entries(parsed).forEach(([key, val]) => {
          initial[key] = deserializeFilterValue(val as string)
        })
      }
    } catch {
      // Ignorar erro de parse
    }

    // Sobrescrever com query params (prioridade)
    searchParams?.forEach((value: string, key: string) => {
      if (key.startsWith(URL_PARAM_PREFIX)) {
        const filterId = key.slice(URL_PARAM_PREFIX.length)
        initial[filterId] = deserializeFilterValue(value)
      }
    })

    // Aplicar valores padrão dos filtros disponíveis
    availableFilters?.forEach(filter => {
      if (filter.defaultValue !== undefined && initial[filter.id] === undefined) {
        initial[filter.id] = filter.defaultValue as FilterValue
      }
    })

    return initial
  })

  // Sincronizar com URL quando valores mudam
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)

    // Remover todos os filtros antigos
    Array.from(newParams.keys())
      .filter(k => k.startsWith(URL_PARAM_PREFIX))
      .forEach(k => newParams.delete(k))

    // Adicionar filtros ativos
    Object.entries(values).forEach(([id, value]) => {
      const serialized = serializeFilterValue(value)
      if (serialized) {
        newParams.set(`${URL_PARAM_PREFIX}${id}`, serialized)
      }
    })

    router.replace(`${currentPath}?${newParams.toString()}`)

    // Salvar no localStorage
    const toStore: Record<string, string | null> = {}
    Object.entries(values).forEach(([id, value]) => {
      toStore[id] = serializeFilterValue(value)
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  }, [values, searchParams, router, currentPath])

  // Filtros ativos
  const activeFilters = useMemo(() => {
    return Object.entries(values)
      .filter(([, value]) => {
        if (value === null || value === undefined) return false
        if (Array.isArray(value) && value.length === 0) return false
        if (value === '' || value === 'all') return false
        return true
      })
      .map(([id, value]) => ({ id, value }))
  }, [values])

  // Quantidade de filtros ativos
  const activeCount = activeFilters.length

  // ─────────────────────────────────────────────────────────────
  // Métodos
  // ─────────────────────────────────────────────────────────────

  const getValue = useCallback(
    (filterId: string): FilterValue => {
      return values[filterId] ?? null
    },
    [values]
  )

  const setValue = useCallback((filterId: string, value: FilterValue) => {
    setValues(prev => ({
      ...prev,
      [filterId]: value,
    }))
  }, [])

  const clearFilter = useCallback((filterId: string) => {
    setValues(prev => {
      const next = { ...prev }
      delete next[filterId]
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setValues({})
  }, [])

  const isActive = useCallback(
    (filterId: string): boolean => {
      const value = values[filterId]
      if (value === null || value === undefined) return false
      if (Array.isArray(value) && value.length === 0) return false
      if (value === '' || value === 'all') return false
      return true
    },
    [values]
  )

  const applyFilters = useCallback((newValues: Record<string, FilterValue>) => {
    setValues(prev => ({
      ...prev,
      ...newValues,
    }))
  }, [])

  // ─────────────────────────────────────────────────────────────
  // Return
  // ─────────────────────────────────────────────────────────────

  return {
    values,
    activeFilters,
    activeCount,
    getValue,
    setValue,
    clearFilter,
    clearAll,
    isActive,
    applyFilters,
  }
}

export default useFilters
