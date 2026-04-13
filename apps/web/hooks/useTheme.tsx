'use client'

/**
 * useTheme — Hook + Context para alternar dark/light theme via tokens centralizados
 *
 * Persiste em localStorage + aplica classe no <html>.
 * Respeita prefers-color-scheme como padrão inicial.
 * Transição suave via classe theme-transitioning.
 *
 * USO: envolver a app com <ThemeProvider>, consumir via useTheme().
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme-mode'

interface ThemeContextType {
  mode: ThemeMode
  isDark: boolean
  isLight: boolean
  toggle: () => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // ignore
  }

  // Fallback to system preference
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme)

  // Apply theme class to <html>
  useEffect(() => {
    const html = document.documentElement

    // Add transition class for smooth switch
    html.classList.add('theme-transitioning')

    if (mode === 'light') {
      html.classList.add('light')
    } else {
      html.classList.remove('light')
    }

    // Remove transition class after animation
    const timer = setTimeout(() => {
      html.classList.remove('theme-transitioning')
    }, 350)

    // Persist choice
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // ignore — private browsing etc
    }

    return () => clearTimeout(timer)
  }, [mode])

  const toggle = useCallback(() => {
    setMode((prev: ThemeMode) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode)
  }, [])

  const value: ThemeContextType = {
    mode,
    isDark: mode === 'dark',
    isLight: mode === 'light',
    toggle,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    // Fallback for components outside provider (SSR, tests)
    return {
      mode: 'dark',
      isDark: true,
      isLight: false,
      toggle: () => {},
      setTheme: () => {},
    }
  }
  return ctx
}
