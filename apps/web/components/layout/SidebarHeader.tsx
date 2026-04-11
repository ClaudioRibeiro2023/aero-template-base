'use client'

/**
 * SidebarHeader — Logo, collapse toggle e quick search.
 * Extraído de AppSidebar.tsx (Sprint 5 refactor).
 */
import Image from 'next/image'
import Link from 'next/link'
import { ChevronsLeft, ChevronsRight, Search } from 'lucide-react'
import clsx from 'clsx'

// Detect platform for shortcut display
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
const MOD_KEY = IS_MAC ? '⌘' : 'Ctrl+'

interface SidebarHeaderProps {
  collapsed: boolean
  onToggle?: () => void
  appName: string
  appInitial: string
  logoUrl?: string | null
  logoCompactUrl?: string | null
  onOpenSearch: () => void
}

export function SidebarHeader({
  collapsed,
  onToggle,
  appName,
  appInitial,
  logoUrl,
  logoCompactUrl,
  onOpenSearch,
}: SidebarHeaderProps) {
  return (
    <>
      {/* ── Header: Logo + Collapse Toggle ── */}
      <div
        className={clsx(
          'h-[52px] flex items-center border-b border-[rgba(255,255,255,0.06)]',
          collapsed ? 'flex-col justify-center gap-0 px-1 py-1' : 'justify-between px-3'
        )}
      >
        <Link
          href="/dashboard"
          className={clsx(
            'flex items-center overflow-hidden rounded-lg transition-all duration-200',
            collapsed ? 'justify-center' : 'gap-2.5'
          )}
        >
          {/* Logo: image if available, fallback to initial letter */}
          {(collapsed ? logoCompactUrl : logoUrl) ? (
            <Image
              src={(collapsed ? logoCompactUrl : logoUrl)!}
              alt={appName}
              width={collapsed ? 28 : 32}
              height={collapsed ? 28 : 32}
              fetchPriority="high"
              unoptimized
              className={clsx(
                'rounded-lg object-contain shadow-[0_0_12px_rgba(0,180,216,0.15)]',
                collapsed ? 'w-7 h-7' : 'w-8 h-8 min-w-[32px] rounded-xl'
              )}
            />
          ) : (
            <div
              className={clsx(
                'rounded-lg bg-[var(--brand-primary)] flex items-center justify-center shadow-lg shadow-[var(--brand-primary)]/20 shadow-[0_0_12px_rgba(0,180,216,0.15)]',
                collapsed ? 'w-7 h-7' : 'w-8 h-8 min-w-[32px] rounded-xl'
              )}
            >
              <span className={clsx('text-white font-bold', collapsed ? 'text-xs' : 'text-sm')}>
                {appInitial}
              </span>
            </div>
          )}
          {!collapsed && (
            <span className="text-white font-semibold text-[15px] whitespace-nowrap tracking-tight">
              {appName}
            </span>
          )}
        </Link>
        {onToggle && !collapsed && (
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-[var(--sidebar-item-hover)] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-hover)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Recolher menu"
            aria-label="Recolher menu"
          >
            <ChevronsLeft size={16} />
          </button>
        )}
        {onToggle && collapsed && (
          <button
            onClick={onToggle}
            className="p-1 rounded-md hover:bg-[var(--sidebar-item-hover)] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-hover)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Expandir menu"
            aria-label="Expandir menu"
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </div>

      {/* ── Quick Search Trigger ── */}
      <div className={clsx('px-2 pt-2 pb-1', collapsed && 'px-1.5')}>
        <button
          onClick={onOpenSearch}
          className={clsx(
            'group w-full flex items-center gap-2 rounded-lg transition-all duration-150 ease-out',
            'bg-[rgba(255,255,255,0.03)] hover:bg-white/[0.06] border border-[rgba(255,255,255,0.06)]',
            'text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)]',
            collapsed ? 'p-2 justify-center' : 'px-2.5 py-1.5'
          )}
          title={collapsed ? `Buscar (${MOD_KEY}K)` : undefined}
          aria-label="Abrir busca global"
        >
          <Search size={15} className="flex-shrink-0 group-hover:rotate-12 transition-transform" />
          {!collapsed && (
            <>
              <span className="text-xs flex-1 text-left">Buscar...</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] font-mono text-[var(--sidebar-text-muted)]">
                {MOD_KEY}K
              </kbd>
            </>
          )}
        </button>
      </div>
    </>
  )
}
