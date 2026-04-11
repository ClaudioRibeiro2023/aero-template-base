'use client'

/**
 * useTheme — Hook para alternar dark/light theme via tokens centralizados
 *
 * Persiste em localStorage + aplica classe no <html>.
 * Respeita prefers-color-scheme como padrão inicial.
 * Transição suave via classe theme-transitioning.
 */
import { useState, useEffect, useCallback } from 'react'
type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'theme-mode'

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

export function useTheme() {
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
      // ignore
    }

    return () => clearTimeout(timer)
  }, [mode])

  const toggle = useCallback(() => {
    setMode((prev: ThemeMode) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode)
  }, [])

  return {
    mode,
    isDark: mode === 'dark',
    isLight: mode === 'light',
    toggle,
    setTheme,
  }
}
