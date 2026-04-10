'use client'

/**
 * useUndoToast — Hook para toast com ação de desfazer.
 *
 * Exibe uma mensagem temporária com botão "Desfazer" e countdown.
 * A ação de undo é chamada se o usuário clicar antes do timeout.
 */
import { useState, useEffect, useRef, useCallback } from 'react'

interface UndoToastState {
  message: string
  countdown: number
  onUndo: (() => Promise<void>) | null
  isPending: boolean
}

interface ShowUndoOptions {
  message: string
  onUndo: () => Promise<void>
  timeout?: number // ms, default 5000
}

export function useUndoToast() {
  const [state, setState] = useState<UndoToastState | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setState(null)
  }, [])

  const show = useCallback(
    ({ message, onUndo, timeout = 5000 }: ShowUndoOptions) => {
      // Clear any existing toast
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)

      const seconds = Math.ceil(timeout / 1000)
      setState({ message, countdown: seconds, onUndo, isPending: false })

      // Countdown interval
      let remaining = seconds
      intervalRef.current = setInterval(() => {
        remaining -= 1
        if (remaining <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current)
        } else {
          setState(prev => (prev ? { ...prev, countdown: remaining } : null))
        }
      }, 1000)

      // Auto-dismiss
      timerRef.current = setTimeout(() => {
        dismiss()
      }, timeout)
    },
    [dismiss]
  )

  const handleUndo = useCallback(async () => {
    if (!state?.onUndo) return
    setState(prev => (prev ? { ...prev, isPending: true } : null))
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    try {
      await state.onUndo()
    } finally {
      setState(null)
    }
  }, [state])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return { toast: state, show, dismiss, handleUndo }
}
