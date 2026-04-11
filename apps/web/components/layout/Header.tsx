'use client'

import { usePathname } from 'next/navigation'
import { Search, Moon, Sun, Menu, Globe } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Tooltip, Breadcrumb, BreadcrumbItem } from '@template/design-system'
import { NotificationCenter } from '@/components/common/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'

interface HeaderProps {
  onMobileMenuToggle?: () => void
  onSearchOpen?: () => void
  isMobile?: boolean
  className?: string
}

const LOCALE_LABELS: Record<string, string> = {
  'pt-BR': 'PT',
  'en-US': 'EN',
  es: 'ES',
}

const LOCALE_OPTIONS = Object.entries(LOCALE_LABELS)

export function Header({
  onMobileMenuToggle,
  onSearchOpen,
  isMobile = false,
  className,
}: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const notifs = useNotifications()
  const tNav = useTranslations('nav')
  const tTheme = useTranslations('theme')
  const [showLocalePicker, setShowLocalePicker] = useState(false)
  const { isDark, toggle: toggleTheme } = useTheme()

  const switchLocale = useCallback(
    async (locale: string) => {
      try {
        await fetch('/api/user/locale', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locale }),
        })
        document.cookie = `locale=${locale};path=/;max-age=31536000`
        router.refresh()
      } catch {
        // Fallback: apenas cookie
        document.cookie = `locale=${locale};path=/;max-age=31536000`
        router.refresh()
      }
      setShowLocalePicker(false)
    },
    [router]
  )

  // Friendly label mapping for breadcrumb segments (P3-02)
  const SEGMENT_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    admin: 'Administração',
    usuarios: 'Usuários',
    config: 'Configurações',
    geral: 'Geral',
    aparencia: 'Aparência',
    integracoes: 'Integrações',
    notificacoes: 'Notificações',
    relatorios: 'Relatórios',
    profile: 'Perfil',
    tasks: 'Tarefas',
  }

  function segmentLabel(seg: string): string {
    return SEGMENT_LABELS[seg.toLowerCase()] ?? seg.charAt(0).toUpperCase() + seg.slice(1)
  }

  // Generate breadcrumb from path
  const pathSegments = pathname.split('/').filter(Boolean)

  return (
    <header
      className={`h-[52px] bg-transparent border-b border-[rgba(255,255,255,0.06)] px-3 md:px-5 flex items-center justify-between gap-2${className ? ` ${className}` : ''}`}
    >
      {/* Left section */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Mobile menu toggle — visible only on mobile */}
        {isMobile && (
          <Tooltip content={tNav('mainMenu')}>
            <button
              onClick={onMobileMenuToggle}
              className="p-1.5 -ms-1 rounded-lg hover:bg-white/[0.04] transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={tNav('openMenu')}
            >
              <Menu size={20} className="text-[var(--text-secondary)]" />
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
                  {segmentLabel(seg)}
                </BreadcrumbItem>
              )
            })}
          </Breadcrumb>
        </div>

        {/* Mobile: show current page title */}
        {isMobile && (
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
            {pathSegments.length > 0
              ? segmentLabel(pathSegments[pathSegments.length - 1])
              : tNav('home')}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Search — hidden on mobile (use Ctrl+K or GlobalSearch) */}
        <Tooltip content={tNav('searchShortcut')}>
          <button
            onClick={onSearchOpen}
            className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors hidden sm:flex min-w-[44px] min-h-[44px] items-center justify-center"
            aria-label={tNav('openSearch')}
          >
            <Search size={18} className="text-[var(--text-secondary)]" />
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

        {/* Locale picker */}
        <div className="relative">
          <Tooltip content="Idioma">
            <button
              onClick={() => setShowLocalePicker(prev => !prev)}
              className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Trocar idioma"
              aria-expanded={showLocalePicker}
            >
              <Globe size={isMobile ? 16 : 18} className="text-[var(--text-secondary)]" />
            </button>
          </Tooltip>
          {showLocalePicker && (
            <div className="absolute end-0 top-full mt-1 z-50 bg-[rgba(24,24,27,0.95)] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-xl py-1 min-w-[80px] backdrop-blur-lg">
              {LOCALE_OPTIONS.map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => switchLocale(code)}
                  className="w-full px-3 py-1.5 text-xs text-start text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)] transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <Tooltip content={isDark ? tTheme('light') : tTheme('dark')}>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={tNav('toggleTheme')}
          >
            {isDark ? (
              <Sun size={isMobile ? 16 : 18} className="text-[var(--text-secondary)]" />
            ) : (
              <Moon size={isMobile ? 16 : 18} className="text-[var(--text-secondary)]" />
            )}
          </button>
        </Tooltip>
      </div>
    </header>
  )
}
