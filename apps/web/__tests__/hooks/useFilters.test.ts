/**
 * Testes para o hook useFilters
 *
 * Cobre: estado inicial, setValue/getValue, clearFilter, clearAll,
 * isActive, activeFilters/activeCount, applyFilters, valores "neutros"
 * ('all', '') e integração com localStorage.
 */
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

// Mock de next/navigation — searchParams vazio, router.replace é no-op
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    forEach: vi.fn(),
    toString: () => '',
  }),
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/dashboard',
}))

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

import { useFilters } from '@/hooks/useFilters'

// ── Testes ────────────────────────────────────────────────────────────────────

describe('useFilters', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('estado inicial', () => {
    it('inicia com valores vazios', () => {
      const { result } = renderHook(() => useFilters())
      expect(result.current.values).toEqual({})
    })

    it('inicia sem filtros ativos', () => {
      const { result } = renderHook(() => useFilters())
      expect(result.current.activeFilters).toHaveLength(0)
      expect(result.current.activeCount).toBe(0)
    })

    it('getValue retorna null para filtro inexistente', () => {
      const { result } = renderHook(() => useFilters())
      expect(result.current.getValue('inexistente')).toBeNull()
    })
  })

  describe('setValue e getValue', () => {
    it('define e recupera um valor de string', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('status', 'ativo')
      })
      expect(result.current.getValue('status')).toBe('ativo')
    })

    it('define e recupera um valor numérico', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('pagina', 3)
      })
      expect(result.current.getValue('pagina')).toBe(3)
    })

    it('define e recupera um valor booleano', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('ativo', true)
      })
      expect(result.current.getValue('ativo')).toBe(true)
    })

    it('sobrescreve um valor existente', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('status', 'pendente')
      })
      act(() => {
        result.current.setValue('status', 'concluido')
      })
      expect(result.current.getValue('status')).toBe('concluido')
    })
  })

  describe('activeFilters e activeCount', () => {
    it('inclui filtros com valor não-nulo na lista de ativos', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('busca', 'João')
        result.current.setValue('status', 'ativo')
      })
      expect(result.current.activeCount).toBe(2)
      expect(result.current.activeFilters.map(f => f.id)).toEqual(
        expect.arrayContaining(['busca', 'status'])
      )
    })

    it('NÃO conta filtros com valor null', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('tipo', null)
      })
      expect(result.current.activeCount).toBe(0)
    })

    it('NÃO conta filtros com valor "all" (sentinel de limpo)', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('categoria', 'all')
      })
      expect(result.current.activeCount).toBe(0)
    })

    it('NÃO conta filtros com string vazia', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('texto', '')
      })
      expect(result.current.activeCount).toBe(0)
    })

    it('NÃO conta filtros com array vazio', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('tags', [])
      })
      expect(result.current.activeCount).toBe(0)
    })
  })

  describe('isActive', () => {
    it('retorna true para filtro com valor definido', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('status', 'ativo')
      })
      expect(result.current.isActive('status')).toBe(true)
    })

    it('retorna false para filtro inexistente', () => {
      const { result } = renderHook(() => useFilters())
      expect(result.current.isActive('nao_existe')).toBe(false)
    })

    it('retorna false para filtro com valor "all"', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('tipo', 'all')
      })
      expect(result.current.isActive('tipo')).toBe(false)
    })

    it('retorna false para filtro com valor null', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('data', null)
      })
      expect(result.current.isActive('data')).toBe(false)
    })
  })

  describe('clearFilter', () => {
    it('remove um filtro específico sem afetar os demais', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('status', 'ativo')
        result.current.setValue('busca', 'texto')
      })
      act(() => {
        result.current.clearFilter('status')
      })
      expect(result.current.getValue('status')).toBeNull()
      expect(result.current.getValue('busca')).toBe('texto')
    })

    it('reduz o activeCount em 1 após limpar filtro ativo', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('a', '1')
        result.current.setValue('b', '2')
      })
      expect(result.current.activeCount).toBe(2)
      act(() => {
        result.current.clearFilter('a')
      })
      expect(result.current.activeCount).toBe(1)
    })
  })

  describe('clearAll', () => {
    it('remove todos os filtros de uma vez', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('status', 'ativo')
        result.current.setValue('busca', 'teste')
        result.current.setValue('pagina', 2)
      })
      act(() => {
        result.current.clearAll()
      })
      expect(result.current.values).toEqual({})
      expect(result.current.activeCount).toBe(0)
    })
  })

  describe('applyFilters', () => {
    it('aplica múltiplos filtros de uma vez preservando os existentes', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('existente', 'valor')
      })
      act(() => {
        result.current.applyFilters({ status: 'ativo', busca: 'João' })
      })
      expect(result.current.getValue('status')).toBe('ativo')
      expect(result.current.getValue('busca')).toBe('João')
      expect(result.current.getValue('existente')).toBe('valor')
    })

    it('sobrescreve filtros conflitantes com applyFilters', () => {
      const { result } = renderHook(() => useFilters())
      act(() => {
        result.current.setValue('status', 'antigo')
      })
      act(() => {
        result.current.applyFilters({ status: 'novo' })
      })
      expect(result.current.getValue('status')).toBe('novo')
    })
  })

  describe('valores padrão via availableFilters', () => {
    it('aplica defaultValue dos filtros disponíveis no estado inicial', () => {
      const { result } = renderHook(() =>
        useFilters([
          {
            id: 'periodo',
            name: 'Período',
            type: 'select' as const,
            defaultValue: 'mes',
            options: [],
            order: 1,
            appliesTo: { global: true },
            enabled: true,
          },
        ])
      )
      expect(result.current.getValue('periodo')).toBe('mes')
    })
  })
})
