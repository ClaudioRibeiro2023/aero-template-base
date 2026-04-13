/**
 * useTheme Hook Tests
 *
 * Testa ThemeProvider e useTheme hook.
 * Verifica persistencia em localStorage e fallback seguro.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/hooks/useTheme'

// ── Helper: componente que expoe estado do tema ──
function TestThemeConsumer() {
  const { mode, isDark, isLight, toggle, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="isDark">{String(isDark)}</span>
      <span data-testid="isLight">{String(isLight)}</span>
      <button data-testid="toggle" onClick={toggle}>
        Toggle
      </button>
      <button data-testid="setLight" onClick={() => setTheme('light')}>
        Light
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza children', () => {
    render(
      <ThemeProvider>
        <span data-testid="child">Hello</span>
      </ThemeProvider>
    )
    expect(screen.getByTestId('child')).toHaveTextContent('Hello')
  })

  it('modo inicial e dark (SSR consistency)', () => {
    render(
      <ThemeProvider>
        <TestThemeConsumer />
      </ThemeProvider>
    )
    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('isDark')).toHaveTextContent('true')
    expect(screen.getByTestId('isLight')).toHaveTextContent('false')
  })

  it('toggle alterna de dark para light', async () => {
    render(
      <ThemeProvider>
        <TestThemeConsumer />
      </ThemeProvider>
    )

    await act(async () => {
      screen.getByTestId('toggle').click()
    })

    expect(screen.getByTestId('mode')).toHaveTextContent('light')
    expect(screen.getByTestId('isDark')).toHaveTextContent('false')
    expect(screen.getByTestId('isLight')).toHaveTextContent('true')
  })

  it('setTheme define modo diretamente', async () => {
    render(
      <ThemeProvider>
        <TestThemeConsumer />
      </ThemeProvider>
    )

    await act(async () => {
      screen.getByTestId('setLight').click()
    })

    expect(screen.getByTestId('mode')).toHaveTextContent('light')
  })

  it('persiste no localStorage apos toggle', async () => {
    render(
      <ThemeProvider>
        <TestThemeConsumer />
      </ThemeProvider>
    )

    await act(async () => {
      screen.getByTestId('toggle').click()
    })

    // Wait for useEffect to persist
    await act(async () => {
      await new Promise(r => setTimeout(r, 50))
    })

    expect(localStorage.getItem('theme-mode')).toBe('light')
  })
})

describe('useTheme — fallback fora do provider', () => {
  it('retorna defaults seguros sem ThemeProvider', () => {
    render(<TestThemeConsumer />)
    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('isDark')).toHaveTextContent('true')
    expect(screen.getByTestId('isLight')).toHaveTextContent('false')
  })

  it('toggle noop fora do provider nao causa erro', async () => {
    render(<TestThemeConsumer />)
    await act(async () => {
      screen.getByTestId('toggle').click()
    })
    // Should not crash, mode stays dark
    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
  })
})
