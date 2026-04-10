/**
 * Testes para o componente Header
 *
 * Cobre: renderização básica, botão de menu mobile, toggle de tema,
 * breadcrumb a partir do pathname, e integração com i18n.
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ──────────────────────────────────────────────────────────────────────

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/usuarios',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}))

vi.mock('@template/design-system', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Breadcrumb: ({ children }: { children: React.ReactNode }) => (
    <nav aria-label="breadcrumb">{children}</nav>
  ),
  BreadcrumbItem: ({
    children,
    href,
    current,
  }: {
    children: React.ReactNode
    href?: string
    current?: boolean
  }) => (
    <span aria-current={current ? 'page' : undefined}>
      {href ? <a href={href}>{children}</a> : children}
    </span>
  ),
}))

vi.mock('@/components/common/NotificationCenter', () => ({
  NotificationCenter: () => <div data-testid="notification-center" />,
}))

vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [],
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    dismiss: vi.fn(),
    clearAll: vi.fn(),
  }),
}))

const translations: Record<string, Record<string, string>> = {
  nav: {
    mainMenu: 'Menu principal',
    openMenu: 'Abrir menu',
    home: 'Início',
    searchShortcut: 'Buscar',
    openSearch: 'Abrir busca',
    toggleTheme: 'Alternar tema',
  },
  theme: {
    light: 'Tema claro',
    dark: 'Tema escuro',
  },
}

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => translations[ns]?.[key] ?? key,
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    clear: () => {
      store = {}
    },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
})

// ── Import do componente (após mocks) ──────────────────────────────────────────
import { Header } from '@/components/layout/Header'

// ── Testes ────────────────────────────────────────────────────────────────────

describe('Header', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('renderização básica', () => {
    it('renderiza o elemento header no DOM', () => {
      render(<Header />)
      const header = document.querySelector('header')
      expect(header).toBeInTheDocument()
    })

    it('renderiza o centro de notificações', () => {
      render(<Header />)
      expect(screen.getByTestId('notification-center')).toBeInTheDocument()
    })

    it('renderiza o botão de alternância de tema', () => {
      render(<Header />)
      const themeBtn = screen.getByLabelText('Alternar tema')
      expect(themeBtn).toBeInTheDocument()
    })
  })

  describe('modo mobile', () => {
    it('exibe botão de menu quando isMobile=true', () => {
      render(<Header isMobile={true} onMobileMenuToggle={vi.fn()} />)
      const menuBtn = screen.getByLabelText('Abrir menu')
      expect(menuBtn).toBeInTheDocument()
    })

    it('NÃO exibe botão de menu quando isMobile=false (padrão)', () => {
      render(<Header isMobile={false} />)
      expect(screen.queryByLabelText('Abrir menu')).not.toBeInTheDocument()
    })

    it('chama onMobileMenuToggle ao clicar no botão de menu', () => {
      const onToggle = vi.fn()
      render(<Header isMobile={true} onMobileMenuToggle={onToggle} />)
      fireEvent.click(screen.getByLabelText('Abrir menu'))
      expect(onToggle).toHaveBeenCalledOnce()
    })
  })

  describe('alternância de tema', () => {
    it('chama setItem no localStorage ao clicar no botão de tema', () => {
      render(<Header />)
      const themeBtn = screen.getByLabelText('Alternar tema')
      fireEvent.click(themeBtn)
      expect(localStorageMock.getItem('theme')).toBeTruthy()
    })

    it('aplica classe "dark" ou remove do documentElement ao alternar tema', () => {
      render(<Header />)
      const themeBtn = screen.getByLabelText('Alternar tema')
      const previousTheme = document.documentElement.getAttribute('data-theme')
      fireEvent.click(themeBtn)
      const newTheme = document.documentElement.getAttribute('data-theme')
      expect(newTheme).not.toBeNull()
      expect(newTheme).not.toBe(previousTheme)
    })
  })

  describe('breadcrumb', () => {
    it('renderiza breadcrumb com segmentos do pathname', () => {
      render(<Header />)
      // O pathname mockado é /dashboard/usuarios
      // BreadcrumbItem renderiza o texto do segmento capitalizado
      const breadcrumbContainer = document.querySelector('[aria-label="breadcrumb"]')
      expect(breadcrumbContainer).toBeInTheDocument()
      expect(breadcrumbContainer?.textContent).toContain('Dashboard')
    })
  })
})
