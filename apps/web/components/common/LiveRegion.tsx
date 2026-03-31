'use client'

/**
 * LiveRegion - Componente global para anuncios a screen readers.
 *
 * Sprint 3: Acessibilidade Core (WCAG 2.1 AA)
 * Renderiza um <div role="status" aria-live="polite"> oculto visualmente.
 * Integrado via AnnouncerProvider para que qualquer componente possa
 * chamar `announce('mensagem')` sem precisar renderizar seu proprio live region.
 */

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'

// ============================================================================
// Context
// ============================================================================

interface AnnouncerContextValue {
  announce: (message: string, politeness?: 'polite' | 'assertive') => void
}

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null)

/**
 * Hook para acessar o announcer global.
 * Deve ser usado dentro de <AnnouncerProvider>.
 */
export function useGlobalAnnouncer(): AnnouncerContextValue {
  const ctx = useContext(AnnouncerContext)
  if (!ctx) {
    // Fallback silencioso para evitar crash em contextos sem provider
    return { announce: () => {} }
  }
  return ctx
}

// ============================================================================
// Provider
// ============================================================================

export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [politeMessage, setPoliteMessage] = useState('')
  const [assertiveMessage, setAssertiveMessage] = useState('')
  const politeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const assertiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const announce = useCallback((message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    const setMessage = politeness === 'assertive' ? setAssertiveMessage : setPoliteMessage
    const timerRef = politeness === 'assertive' ? assertiveTimerRef : politeTimerRef

    if (timerRef.current) clearTimeout(timerRef.current)

    // Limpa antes para garantir que mensagens repetidas sejam anunciadas
    setMessage('')
    setTimeout(() => {
      setMessage(message)
      timerRef.current = setTimeout(() => setMessage(''), 1000)
    }, 50)
  }, [])

  useEffect(() => {
    const politeTimer = politeTimerRef
    const assertiveTimer = assertiveTimerRef
    return () => {
      if (politeTimer.current) clearTimeout(politeTimer.current)
      if (assertiveTimer.current) clearTimeout(assertiveTimer.current)
    }
  }, [])

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Live regions ocultos visualmente, mas acessiveis a screen readers */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {politeMessage}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  )
}
