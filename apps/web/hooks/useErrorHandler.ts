import { useCallback, useState } from 'react'

export interface ErrorState {
  error: Error | null
  message: string | null
  code?: string | number
}

export interface UseErrorHandlerOptions {
  /** Callback when error occurs */
  onError?: (error: Error) => void
  /** Auto-clear error after ms (0 = never) */
  autoClearMs?: number
  /** Default error message */
  defaultMessage?: string
}

/**
 * Hook for consistent error handling across components
 *
 * @example
 * ```tsx
 * const { error, handleError, clearError, withErrorHandler } = useErrorHandler()
 *
 * const fetchData = withErrorHandler(async () => {
 *   const response = await api.get('/data')
 *   return response.data
 * })
 * ```
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { onError, autoClearMs = 0, defaultMessage = 'Ocorreu um erro inesperado' } = options

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    message: null,
  })

  const handleError = useCallback(
    (error: unknown, customMessage?: string) => {
      const errorObj = error instanceof Error ? error : new Error(String(error))
      const message = customMessage || errorObj.message || defaultMessage

      // Extract error code if available
      const code = (error as { code?: string | number })?.code

      setErrorState({ error: errorObj, message, code })

      // Log error for debugging
      console.error('[useErrorHandler]', { error: errorObj, message, code })

      // Call custom handler
      onError?.(errorObj)

      // Auto-clear if configured
      if (autoClearMs > 0) {
        setTimeout(() => {
          setErrorState({ error: null, message: null })
        }, autoClearMs)
      }
    },
    [onError, autoClearMs, defaultMessage]
  )

  const clearError = useCallback(() => {
    setErrorState({ error: null, message: null })
  }, [])

  /**
   * Wrapper for async functions with automatic error handling
   */
  const withErrorHandler = useCallback(
    <T>(fn: () => Promise<T>, errorMessage?: string): (() => Promise<T | undefined>) => {
      return async () => {
        try {
          clearError()
          return await fn()
        } catch (error) {
          handleError(error, errorMessage)
          return undefined
        }
      }
    },
    [handleError, clearError]
  )

  /**
   * Execute async function with error handling
   */
  const execute = useCallback(
    async <T>(fn: () => Promise<T>, errorMessage?: string): Promise<T | undefined> => {
      try {
        clearError()
        return await fn()
      } catch (error) {
        handleError(error, errorMessage)
        return undefined
      }
    },
    [handleError, clearError]
  )

  return {
    error: errorState.error,
    errorMessage: errorState.message,
    errorCode: errorState.code,
    hasError: errorState.error !== null,
    handleError,
    clearError,
    withErrorHandler,
    execute,
  }
}
