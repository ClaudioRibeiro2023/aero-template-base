'use client'

/**
 * SidebarFooter — User avatar, settings link e logout.
 * Extraído de AppSidebar.tsx (Sprint 5 refactor).
 */
import { useMemo } from 'react'
import Link from 'next/link'
import { Settings, LogOut } from 'lucide-react'
import clsx from 'clsx'

interface SidebarFooterProps {
  collapsed: boolean
  userName?: string
  onLogout: () => void
}

export function SidebarFooter({ collapsed, userName, onLogout }: SidebarFooterProps) {
  const userInitials = useMemo(() => {
    const name = userName || 'U'
    const parts = name.split(' ')
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name[0].toUpperCase()
  }, [userName])

  return (
    <div
      className={clsx('border-t border-[var(--sidebar-border)]', collapsed ? 'p-2' : 'px-3 py-2.5')}
    >
      {collapsed ? (
        <div className="flex flex-col items-center gap-1.5">
          <div
            className="avatar-gradient-border w-7 h-7 rounded-full bg-[rgba(0,180,216,0.15)] flex items-center justify-center text-[var(--brand-primary)] text-[10px] font-semibold"
            title={userName || 'Usuário'}
          >
            {userInitials}
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-md hover:bg-[var(--sidebar-item-hover)] text-[var(--sidebar-text-muted)] hover:text-rose-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Sair"
            aria-label="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      ) : (
        <div className="group flex items-center gap-2.5">
          <div className="avatar-gradient-border w-7 h-7 rounded-full bg-[rgba(0,180,216,0.15)] flex items-center justify-center text-[var(--brand-primary)] text-[10px] font-semibold flex-shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[var(--sidebar-user-text)] truncate leading-tight">
              {userName || 'Usuário'}
            </p>
          </div>
          <Link
            href="/admin/config"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-[var(--sidebar-item-hover)] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-hover)] flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Configurações"
            aria-label="Configurações"
          >
            <Settings size={14} />
          </Link>
          <button
            onClick={onLogout}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-[var(--sidebar-item-hover)] text-[var(--sidebar-text-muted)] hover:text-rose-400 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Sair"
            aria-label="Sair"
          >
            <LogOut size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
