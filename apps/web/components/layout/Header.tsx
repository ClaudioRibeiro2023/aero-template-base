'use client'

import { usePathname } from 'next/navigation'
import { Search, Moon, Sun, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Tooltip, Breadcrumb, BreadcrumbItem } from '@template/design-system'
import { NotificationCenter } from '@/components/common/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'

interface HeaderProps {
  onMobileMenuToggle?: () => void
  isMobile?: boolean
}

export function Header({ onMobileMenuToggle, isMobile = false }: HeaderProps) {
  const pathname = usePathname()
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
    <header className="h-[52px] bg-transparent border-b border-[rgba(255,255,255,0.06)] px-3 md:px-5 flex items-center justify-between gap-2">
      {/* Left section */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {/* Mobile menu toggle — visible only on mobile */}
        {isMobile && (
          <Tooltip content="Menu">
            <button
              onClick={onMobileMenuToggle}
              className="p-1.5 -ml-1 rounded-lg hover:bg-white/[0.04] transition-colors flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Abrir menu"
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
              : 'Início'}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Search — hidden on mobile (use Ctrl+K or GlobalSearch) */}
        <Tooltip content="Buscar (Ctrl+K)">
          <button
            className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors hidden sm:flex min-w-[44px] min-h-[44px] items-center justify-center"
            aria-label="Buscar"
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

        {/* Theme toggle */}
        <Tooltip content={isDark ? 'Modo claro' : 'Modo escuro'}>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Alternar tema"
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
