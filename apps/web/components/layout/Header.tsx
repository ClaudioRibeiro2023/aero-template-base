'use client'

import { usePathname } from 'next/navigation'
import { Search, Moon, Sun, PanelLeftClose, PanelLeft, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip, Breadcrumb, BreadcrumbItem } from '@template/design-system'
import { LanguageSelector } from '@/components/common/LanguageSelector'
import { NotificationCenter } from '@/components/common/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'

interface HeaderProps {
  showPanelToggle?: boolean
  isPanelOpen?: boolean
  onTogglePanel?: () => void
  onMobileMenuToggle?: () => void
  isMobile?: boolean
}

export function Header({
  showPanelToggle,
  isPanelOpen,
  onTogglePanel,
  onMobileMenuToggle,
  isMobile = false,
}: HeaderProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const notifs = useNotifications()
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  // Aplicar tema ao montar e quando mudar
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark(prev => !prev)
  }

  // Generate breadcrumb from path
  const pathSegments = pathname.split('/').filter(Boolean)

  return (
    <header className="h-14 md:h-16 bg-surface-elevated border-b border-border-default px-3 md:px-6 flex items-center justify-between gap-2">
      {/* Left section */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Mobile menu toggle — visible only on mobile */}
        {isMobile && (
          <Tooltip content="Menu">
            <button
              onClick={onMobileMenuToggle}
              className="p-2 -ml-1 rounded-lg hover:bg-surface-muted transition-colors flex-shrink-0"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
          </Tooltip>
        )}

        {/* Panel toggle — desktop/tablet only */}
        {showPanelToggle && !isMobile && (
          <Tooltip content={isPanelOpen ? 'Fechar painel de funções' : 'Abrir painel de funções'}>
            <button
              onClick={onTogglePanel}
              className="p-2 rounded-lg hover:bg-surface-muted transition-colors"
              aria-label={isPanelOpen ? 'Fechar painel' : 'Abrir painel'}
            >
              {isPanelOpen ? (
                <PanelLeftClose size={20} className="text-text-secondary" />
              ) : (
                <PanelLeft size={20} className="text-text-secondary" />
              )}
            </button>
          </Tooltip>
        )}

        {/* Breadcrumb — hidden on mobile */}
        <div className="hidden sm:block min-w-0 truncate">
          <Breadcrumb separator="/">
            <BreadcrumbItem href="/dashboard">Template</BreadcrumbItem>
            {pathSegments.map((seg, i) => {
              const isLast = i === pathSegments.length - 1
              const segPath = '/' + pathSegments.slice(0, i + 1).join('/')
              return (
                <BreadcrumbItem key={segPath} current={isLast} href={isLast ? undefined : segPath}>
                  {seg.charAt(0).toUpperCase() + seg.slice(1)}
                </BreadcrumbItem>
              )
            })}
          </Breadcrumb>
        </div>

        {/* Mobile: show current page title */}
        {isMobile && (
          <span className="text-sm font-medium text-text-primary truncate">
            {pathSegments.length > 0
              ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() +
                pathSegments[pathSegments.length - 1].slice(1)
              : 'Início'}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
        {/* Search — hidden on mobile (use Ctrl+K or GlobalSearch) */}
        <Tooltip content="Buscar (Ctrl+K)">
          <button
            className="p-2 rounded-lg hover:bg-surface-muted transition-colors hidden sm:flex"
            aria-label="Buscar"
          >
            <Search size={20} className="text-text-secondary" />
          </button>
        </Tooltip>

        {/* Notifications */}
        <NotificationCenter
          notifications={notifs.notifications}
          onMarkRead={notifs.markRead}
          onMarkAllRead={notifs.markAllRead}
          onDismiss={notifs.dismiss}
          onClear={notifs.clearAll}
          compact={isMobile}
        />

        {/* Language Selector */}
        <LanguageSelector compact={isMobile} />

        {/* Theme toggle */}
        <Tooltip
          content={isDark ? t('app.lightMode', 'Modo claro') : t('app.darkMode', 'Modo escuro')}
        >
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-surface-muted transition-colors"
            aria-label="Alternar tema"
          >
            {isDark ? (
              <Sun size={isMobile ? 18 : 20} className="text-text-secondary" />
            ) : (
              <Moon size={isMobile ? 18 : 20} className="text-text-secondary" />
            )}
          </button>
        </Tooltip>
      </div>
    </header>
  )
}
