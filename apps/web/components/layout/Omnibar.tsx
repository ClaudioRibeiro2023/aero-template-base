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
import { AmbientCluster } from './AmbientCluster'

interface OmnibarProps {
  onMobileMenuToggle?: () => void
  onSearchOpen?: () => void
  isMobile?: boolean
  className?: string
  /** Config opcional do cluster (cidade/coords) — caso não seja fornecido, usa defaults */
  ambient?: {
    locale?: string
    city?: string
    lat?: number
    lon?: number
  }
}

const LOCALE_LABELS: Record<string, string> = {
  'pt-BR': 'PT',
  'en-US': 'EN',
  es: 'ES',
}
const LOCALE_OPTIONS = Object.entries(LOCALE_LABELS)

const SEGMENT_KEYS = new Set([
  'dashboard',
  'admin',
  'usuarios',
  'config',
  'geral',
  'aparencia',
  'integracoes',
  'notificacoes',
  'relatorios',
  'profile',
  'tasks',
])

/**
 * Omnibar — topbar pill 56px com AmbientCluster integrado.
 * Design validado 2026-04-22 (Proposta C · Opção A).
 * Substitui a <Header /> legacy.
 */
export function Omnibar({
  onMobileMenuToggle,
  onSearchOpen,
  isMobile = false,
  className,
  ambient,
}: OmnibarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const notifs = useNotifications()
  const tNav = useTranslations('nav')
  const tSeg = useTranslations('nav.segments')
  const tTheme = useTranslations('theme')

  const segmentLabel = useCallback(
    (seg: string): string => {
      const key = seg.toLowerCase()
      if (SEGMENT_KEYS.has(key)) {
        try {
          return tSeg(key)
        } catch {
          /* fall-through */
        }
      }
      return seg.charAt(0).toUpperCase() + seg.slice(1)
    },
    [tSeg]
  )
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
        document.cookie = `locale=${locale};path=/;max-age=31536000`
        router.refresh()
      }
      setShowLocalePicker(false)
    },
    [router]
  )

  const pathSegments = pathname.split('/').filter(Boolean)

  return (
    <div className={`px-3 md:px-5 pt-3 ${className ?? ''}`}>
      <header
        className="omni-pill flex items-center gap-3 px-2 md:px-3"
        role="banner"
        aria-label="Barra de navegação"
      >
        {/* ── Bloco 1 · Ambiente (data · hora · clima) ── */}
        <div className="hidden md:flex items-center pl-1">
          <AmbientCluster
            locale={ambient?.locale ?? 'pt-BR'}
            city={ambient?.city ?? 'SP'}
            lat={ambient?.lat}
            lon={ambient?.lon}
          />
        </div>

        {/* ── Mobile menu toggle ── */}
        {isMobile && (
          <Tooltip content={tNav('mainMenu')}>
            <button
              onClick={onMobileMenuToggle}
              className="p-1.5 rounded-full hover:bg-[var(--sidebar-item-hover)] transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={tNav('openMenu')}
            >
              <Menu size={20} className="text-[var(--text-secondary)]" />
            </button>
          </Tooltip>
        )}

        {/* ── Bloco 2 · Breadcrumb (contexto) ── */}
        <div className="hidden sm:block min-w-0 truncate flex-1">
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

        {/* Mobile: page title */}
        {isMobile && (
          <span className="text-sm font-medium text-[var(--text-primary)] truncate flex-1">
            {pathSegments.length > 0
              ? segmentLabel(pathSegments[pathSegments.length - 1])
              : tNav('home')}
          </span>
        )}

        {/* ── Bloco 3 · Ação (busca ⌘K) ── */}
        <Tooltip content={tNav('searchShortcut')}>
          <button
            onClick={onSearchOpen}
            className="p-1.5 rounded-full hover:bg-[var(--sidebar-item-hover)] transition-colors hidden sm:flex min-w-[40px] min-h-[40px] items-center justify-center"
            aria-label={tNav('openSearch')}
          >
            <Search size={18} className="text-[var(--text-secondary)]" />
          </button>
        </Tooltip>

        {/* ── Bloco 4 · Identidade (notif · locale · theme) ── */}
        <div className="flex items-center gap-0.5 flex-shrink-0 pr-1">
          <NotificationCenter
            notifications={notifs.notifications}
            onMarkRead={notifs.markRead}
            onMarkAllRead={notifs.markAllRead}
            onDismiss={notifs.dismiss}
            onClear={notifs.clearAll}
            compact={isMobile}
          />

          <div className="relative">
            <Tooltip content={tNav('language')}>
              <button
                onClick={() => setShowLocalePicker(prev => !prev)}
                className="p-1.5 rounded-full hover:bg-[var(--sidebar-item-hover)] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label={tNav('changeLanguage')}
                aria-expanded={showLocalePicker}
              >
                <Globe size={isMobile ? 16 : 18} className="text-[var(--text-secondary)]" />
              </button>
            </Tooltip>
            {showLocalePicker && (
              <div className="absolute end-0 top-full mt-2 z-50 bg-[var(--bg-surface)]/95 border border-[var(--glass-border)] rounded-lg shadow-xl py-1 min-w-[80px] backdrop-blur-lg">
                {LOCALE_OPTIONS.map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => switchLocale(code)}
                    className="w-full px-3 py-1.5 text-xs text-start text-[var(--text-secondary)] hover:bg-[var(--sidebar-item-hover)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Tooltip content={isDark ? tTheme('light') : tTheme('dark')}>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-[var(--sidebar-item-hover)] transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
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
    </div>
  )
}
