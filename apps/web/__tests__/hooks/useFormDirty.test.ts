/**
 * Testes para o hook useFormDirty
 *
 * Cobre: estado inicial, markDirty, markClean, listener de beforeunload
 * e comportamento ao limpar o estado sujo.
 */
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFormDirty } from '@/hooks/useFormDirty'

// ── Helpers ───────────────────────────────────────────────────────────────────

let addEventListenerSpy: ReturnType<typeof vi.spyOn>
let removeEventListenerSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  addEventListenerSpy = vi.spyOn(window, 'addEventListener')
  removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
})

afterEach(() => {
  addEventListenerSpy.mockRestore()
  removeEventListenerSpy.mockRestore()
})

// ── Testes ────────────────────────────────────────────────────────────────────

describe('useFormDirty', () => {
  describe('estado inicial', () => {
    it('inicia com isDirty = false', () => {
      const { result } = renderHook(() => useFormDirty())
      expect(result.current.isDirty).toBe(false)
    })

    it('expõe as funções markDirty e markClean', () => {
      const { result } = renderHook(() => useFormDirty())
      expect(typeof result.current.markDirty).toBe('function')
      expect(typeof result.current.markClean).toBe('function')
    })
  })

  describe('markDirty', () => {
    it('muda isDirty para true', () => {
      const { result } = renderHook(() => useFormDirty())
      act(() => {
        result.current.markDirty()
      })
      expect(result.current.isDirty).toBe(true)
    })

    it('registra listener de beforeunload quando isDirty = true', () => {
      const { result } = renderHook(() => useFormDirty())
      act(() => {
        result.current.markDirty()
      })
      expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    })

    it('chamar markDirty múltiplas vezes mantém isDirty = true', () => {
      const { result } = renderHook(() => useFormDirty())
      act(() => {
        result.current.markDirty()
        result.current.markDirty()
      })
      expect(result.current.isDirty).toBe(true)
    })
  })

  describe('markClean', () => {
    it('muda isDirty para false', () => {
      const { result } = renderHook(() => useFormDirty())
      act(() => {
        result.current.markDirty()
      })
      act(() => {
        result.current.markClean()
      })
      expect(result.current.isDirty).toBe(false)
    })

    it('remove listener de beforeunload quando isDirty volta a false', () => {
      const { result, rerender } = renderHook(() => useFormDirty())
      act(() => {
        result.current.markDirty()
      })
      act(() => {
        result.current.markClean()
      })
      rerender()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
    })

    it('chamar markClean quando já limpo não lança erros', () => {
      const { result } = renderHook(() => useFormDirty())
      expect(() => {
        act(() => {
          result.current.markClean()
        })
      }).not.toThrow()
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('ciclo sujo → limpo → sujo', () => {
    it('suporta múltiplos ciclos dirty/clean sem inconsistências', () => {
      const { result } = renderHook(() => useFormDirty())

      act(() => result.current.markDirty())
      expect(result.current.isDirty).toBe(true)

      act(() => result.current.markClean())
      expect(result.current.isDirty).toBe(false)

      act(() => result.current.markDirty())
      expect(result.current.isDirty).toBe(true)

      act(() => result.current.markClean())
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('NÃO registra beforeunload quando não está sujo', () => {
    it('não adiciona listener no estado inicial', () => {
      renderHook(() => useFormDirty())
      // addEventListener pode ter sido chamado por outros efeitos, mas
      // não deve ter sido chamado com 'beforeunload' sem markDirty
      const beforeunloadCalls = addEventListenerSpy.mock.calls.filter(
        ([event]) => event === 'beforeunload'
      )
      expect(beforeunloadCalls).toHaveLength(0)
    })
  })
})
