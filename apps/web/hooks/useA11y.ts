/**
 * Accessibility (a11y) Hooks and Utilities
 *
 * Sprint 20: Acessibilidade - WCAG 2.1 AA
 * Provides keyboard navigation, ARIA helpers, focus management, and announcements.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// ============================================================================
// Types
// ============================================================================

export type AriaLive = 'polite' | 'assertive' | 'off'
export type AriaRole =
  | 'alert'
  | 'alertdialog'
  | 'button'
  | 'dialog'
  | 'navigation'
  | 'main'
  | 'banner'
  | 'contentinfo'
  | 'complementary'
  | 'region'
  | 'search'
  | 'form'
  | 'status'

export interface UseAnnouncerOptions {
  politeness?: AriaLive
  clearDelay?: number
}

export interface UseKeyboardNavigationOptions {
  loop?: boolean
  orientation?: 'horizontal' | 'vertical' | 'both'
  onEscape?: () => void
}

export interface FocusTrapOptions {
  enabled?: boolean
  returnFocusOnDeactivate?: boolean
  initialFocus?: string // CSS selector
}

// ============================================================================
// useAnnouncer — Live region for screen reader announcements
// ============================================================================

/**
 * Returns an `announce` function that posts messages to an aria-live region.
 * The message is cleared after `clearDelay` ms to allow re-announcing the same text.
 *
 * Usage:
 *   const { announce, message } = useAnnouncer()
 *   announce('Task saved successfully')
 */
export function useAnnouncer(options: UseAnnouncerOptions = {}) {
  const { politeness = 'polite', clearDelay = 1000 } = options
  const [message, setMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const announce = useCallback(
    (text: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      // Clear first so repeated identical messages re-trigger announcement
      setMessage('')
      // Small delay ensures DOM mutation is detected by screen readers
      setTimeout(() => {
        setMessage(text)
        timerRef.current = setTimeout(() => setMessage(''), clearDelay)
      }, 50)
    },
    [clearDelay]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { message, announce, politeness }
}

// ============================================================================
// useFocusTrap — Trap keyboard focus within a container
// ============================================================================

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(', ')

export function useFocusTrap(options: FocusTrapOptions = {}) {
  const { enabled = true, returnFocusOnDeactivate = true } = options
  const containerRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    previousFocusRef.current = document.activeElement as HTMLElement

    const container = containerRef.current
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    ).filter(el => !el.closest('[aria-hidden="true"]'))

    if (focusable.length === 0) return

    const firstEl = focusable[0]
    const lastEl = focusable[focusable.length - 1]

    firstEl.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      if (returnFocusOnDeactivate && previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }, [enabled, returnFocusOnDeactivate])

  return containerRef
}

// ============================================================================
// useKeyboardNavigation — Arrow-key navigation for lists/menus
// ============================================================================

export function useKeyboardNavigation(
  itemCount: number,
  options: UseKeyboardNavigationOptions = {}
) {
  const { loop = true, orientation = 'vertical', onEscape } = options
  const [activeIndex, setActiveIndex] = useState(-1)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isVertical = orientation === 'vertical' || orientation === 'both'
      const isHorizontal = orientation === 'horizontal' || orientation === 'both'

      const prev = isVertical ? 'ArrowUp' : isHorizontal ? 'ArrowLeft' : null
      const next = isVertical ? 'ArrowDown' : isHorizontal ? 'ArrowRight' : null

      if (e.key === 'Escape') {
        onEscape?.()
        return
      }

      if (e.key === 'Home') {
        e.preventDefault()
        setActiveIndex(0)
        return
      }

      if (e.key === 'End') {
        e.preventDefault()
        setActiveIndex(itemCount - 1)
        return
      }

      if (
        e.key === next ||
        (orientation === 'both' && (e.key === 'ArrowDown' || e.key === 'ArrowRight'))
      ) {
        e.preventDefault()
        setActiveIndex(i => {
          const next = i + 1
          if (next >= itemCount) return loop ? 0 : i
          return next
        })
        return
      }

      if (
        e.key === prev ||
        (orientation === 'both' && (e.key === 'ArrowUp' || e.key === 'ArrowLeft'))
      ) {
        e.preventDefault()
        setActiveIndex(i => {
          const prev = i - 1
          if (prev < 0) return loop ? itemCount - 1 : i
          return prev
        })
      }
    },
    [itemCount, loop, orientation, onEscape]
  )

  const reset = useCallback(() => setActiveIndex(-1), [])

  return { activeIndex, setActiveIndex, handleKeyDown, reset }
}

// ============================================================================
// useId — Stable unique ID for ARIA relationships
// ============================================================================

let _counter = 0

export function useId(prefix: string = 'a11y'): string {
  const idRef = useRef<string | null>(null)
  if (idRef.current === null) {
    _counter += 1
    idRef.current = `${prefix}-${_counter}`
  }
  return idRef.current
}

// ============================================================================
// useAriaDescribedBy — Link an element to its description
// ============================================================================

export function useAriaDescribedBy() {
  const descriptionId = useId('desc')

  const descriptionProps = {
    id: descriptionId,
  }

  const targetProps = {
    'aria-describedby': descriptionId,
  }

  return { descriptionId, descriptionProps, targetProps }
}

// ============================================================================
// useReducedMotion — Respect prefers-reduced-motion
// ============================================================================

export function useReducedMotion(): boolean {
  // Always false on SSR — updated via useEffect to avoid hydration mismatch
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}

// ============================================================================
// useHighContrast — Detect Windows High Contrast mode
// ============================================================================

export function useHighContrast(): boolean {
  // Always false on SSR — updated via useEffect to avoid hydration mismatch
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(forced-colors: active)')
    setIsHighContrast(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isHighContrast
}

// ============================================================================
// Color Contrast Utilities (WCAG 2.1)
// ============================================================================

/**
 * Calculate relative luminance of an RGB color (0-255 values).
 * WCAG 2.1 formula.
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/**
 * Calculate contrast ratio between two colors.
 * Returns a value between 1 (no contrast) and 21 (max contrast).
 */
export function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const l1 = relativeLuminance(...fg)
  const l2 = relativeLuminance(...bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if a color pair meets WCAG 2.1 contrast requirements.
 * AA: 4.5:1 for normal text, 3:1 for large text.
 * AAA: 7:1 for normal text, 4.5:1 for large text.
 */
export function meetsContrastRequirement(
  fg: [number, number, number],
  bg: [number, number, number],
  level: 'AA' | 'AAA' = 'AA',
  largeText: boolean = false
): boolean {
  const ratio = contrastRatio(fg, bg)
  if (level === 'AAA') return largeText ? ratio >= 4.5 : ratio >= 7
  return largeText ? ratio >= 3 : ratio >= 4.5
}

/**
 * Parse a hex color string (#rrggbb or #rgb) to [r, g, b].
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map(c => c + c)
          .join('')
      : clean
  if (full.length !== 6) return null
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  const num = parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}
