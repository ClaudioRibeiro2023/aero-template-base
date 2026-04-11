import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUndoToast } from '../../hooks/useUndoToast'

describe('useUndoToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('estado inicial e null', () => {
    const { result } = renderHook(() => useUndoToast())
    expect(result.current.toast).toBeNull()
  })

  it('show() define toast com message e countdown correto', () => {
    const { result } = renderHook(() => useUndoToast())
    const onUndo = vi.fn().mockResolvedValue(undefined)

    act(() => {
      result.current.show({ message: 'Item removido', onUndo, timeout: 5000 })
    })

    expect(result.current.toast).not.toBeNull()
    expect(result.current.toast?.message).toBe('Item removido')
    // Math.ceil(5000 / 1000) = 5
    expect(result.current.toast?.countdown).toBe(5)
    expect(result.current.toast?.isPending).toBe(false)
    expect(result.current.toast?.onUndo).toBe(onUndo)
  })

  it('show() com timeout customizado calcula countdown correto', () => {
    const { result } = renderHook(() => useUndoToast())
    const onUndo = vi.fn().mockResolvedValue(undefined)

    act(() => {
      result.current.show({ message: 'Arquivo excluido', onUndo, timeout: 3000 })
    })

    // Math.ceil(3000 / 1000) = 3
    expect(result.current.toast?.countdown).toBe(3)
  })

  it('countdown decrementa a cada segundo via interval', () => {
    const { result } = renderHook(() => useUndoToast())
    const onUndo = vi.fn().mockResolvedValue(undefined)

    act(() => {
      result.current.show({ message: 'Acao desfeita', onUndo, timeout: 5000 })
    })

    expect(result.current.toast?.countdown).toBe(5)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.toast?.countdown).toBe(4)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.toast?.countdown).toBe(3)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.toast?.countdown).toBe(2)
  })

  it('auto-dismiss apos timeout: toast vira null', () => {
    const { result } = renderHook(() => useUndoToast())
    const onUndo = vi.fn().mockResolvedValue(undefined)

    act(() => {
      result.current.show({ message: 'Registro deletado', onUndo, timeout: 5000 })
    })

    expect(result.current.toast).not.toBeNull()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.toast).toBeNull()
  })

  it('auto-dismiss com timeout customizado de 3s', () => {
    const { result } = renderHook(() => useUndoToast())
    const onUndo = vi.fn().mockResolvedValue(undefined)

    act(() => {
      result.current.show({ message: 'Mensagem', onUndo, timeout: 3000 })
    })

    // ainda visivel antes do timeout
    act(() => {
      vi.advanceTimersByTime(2999)
    })
    expect(result.current.toast).not.toBeNull()

    // dispara exatamente no timeout
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.toast).toBeNull()
  })

  it('handleUndo() chama onUndo e limpa o toast', async () => {
    const { result } = renderHook(() => useUndoToast())
    const onUndo = vi.fn().mockResolvedValue(undefined)

    act(() => {
      result.current.show({ message: 'Acao realizada', onUndo, timeout: 5000 })
    })

    expect(result.current.toast).not.toBeNull()

    await act(async () => {
      await result.current.handleUndo()
    })

    expect(onUndo).toHaveBeenCalledOnce()
    expect(result.current.toast).toBeNull()
  })

  it('handleUndo() define isPending=true enquanto aguarda onUndo', async () => {
    const { result } = renderHook(() => useUndoToast())

    let resolveUndo!: () => void
    const onUndo = vi.fn().mockReturnValue(
      new Promise<void>(resolve => {
        resolveUndo = resolve
      })
    )

    act(() => {
      result.current.show({ message: 'Em progresso', onUndo, timeout: 5000 })
    })

    // Inicia handleUndo mas nao aguarda ainda
    let undoPromise: Promise<void>
    act(() => {
      undoPromise = result.current.handleUndo()
    })

    expect(result.current.toast?.isPending).toBe(true)

    await act(async () => {
      resolveUndo()
      await undoPromise!
    })

    expect(result.current.toast).toBeNull()
  })

  it('handleUndo() cancela o timer de auto-dismiss', async () => {
    const { result } = renderHook(() => useUndoToast())
    const onUndo = vi.fn().mockResolvedValue(undefined)

    act(() => {
      result.current.show({ message: 'Acao', onUndo, timeout: 5000 })
    })

    await act(async () => {
      await result.current.handleUndo()
    })

    // Avanca o tempo — o auto-dismiss nao deve reabrir o toast
    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current.toast).toBeNull()
  })

  it('dismiss() limpa o toast imediatamente', () => {
    const { result } = renderHook(() => useUndoToast())
    const onUndo = vi.fn().mockResolvedValue(undefined)

    act(() => {
      result.current.show({ message: 'Para descartar', onUndo, timeout: 5000 })
    })

    expect(result.current.toast).not.toBeNull()

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.toast).toBeNull()
  })

  it('dismiss() cancela o auto-dismiss futuro', () => {
    const { result } = renderHook(() => useUndoToast())
    const onUndo = vi.fn().mockResolvedValue(undefined)

    act(() => {
      result.current.show({ message: 'Cancelar', onUndo, timeout: 5000 })
    })

    act(() => {
      result.current.dismiss()
    })

    // Avanca o timer — nao deve gerar erro nem reabrir toast
    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current.toast).toBeNull()
  })

  it('show() sobrescreve toast anterior sem acumular timers', () => {
    const { result } = renderHook(() => useUndoToast())
    const onUndo1 = vi.fn().mockResolvedValue(undefined)
    const onUndo2 = vi.fn().mockResolvedValue(undefined)

    act(() => {
      result.current.show({ message: 'Primeiro toast', onUndo: onUndo1, timeout: 5000 })
    })

    act(() => {
      result.current.show({ message: 'Segundo toast', onUndo: onUndo2, timeout: 3000 })
    })

    expect(result.current.toast?.message).toBe('Segundo toast')
    expect(result.current.toast?.countdown).toBe(3)

    // Timeout do segundo toast
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.toast).toBeNull()
  })

  it('handleUndo() nao faz nada quando toast e null', async () => {
    const { result } = renderHook(() => useUndoToast())

    // Sem toast ativo — nao deve lancar erro
    await act(async () => {
      await result.current.handleUndo()
    })

    expect(result.current.toast).toBeNull()
  })
})
