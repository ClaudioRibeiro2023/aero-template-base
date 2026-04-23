'use client'

/**
 * SidebarFooter — User avatar, settings link e logout.
 * Extraído de AppSidebar.tsx (Sprint 5 refactor).
 * Sprint QA+: logout com feedback visual (Loader2 + opacity).
 */
import { useMemo, useState, useCallback } from 'react'
import Link from 'next/link'
import { Settings, LogOut, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import clsx from 'clsx'

interface SidebarFooterProps {
  collapsed: boolean
  userName?: string
  onLogout: () => void | Promise<void>
}

export function SidebarFooter({ collapsed, userName, onLogout }: SidebarFooterProps) {
  const t = useTranslations('auth')
  const tNav = useTranslations('nav')
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = useCallback(async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await Promise.resolve(onLogout())
    } catch {
      setLoggingOut(false)
    }
    // Não resetamos loggingOut em sucesso — página vai redirecionar para /login
  }, [loggingOut, onLogout])

  const userInitials = useMemo(() => {
    const name = userName || 'U'
    const parts = name.split(' ')
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name[0].toUpperCase()
  }, [userName])

  const logoutLabel = t('logout')

  return (
    <div className={clsx(collapsed ? 'p-1' : 'px-1 py-0.5')}>
      {collapsed ? (
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={clsx(
              'avatar-gradient-border w-7 h-7 rounded-full bg-[rgba(0,180,216,0.15)] flex items-center justify-center text-[var(--brand-primary)] text-[10px] font-semibold',
              loggingOut && 'opacity-50'
            )}
            title={userName || 'Usuário'}
          >
            {userInitials}
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            aria-busy={loggingOut}
            className={clsx(
              'p-1.5 rounded-md hover:bg-[var(--sidebar-item-hover)] text-[var(--sidebar-text-muted)] hover:text-rose-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center',
              loggingOut && 'opacity-60 cursor-wait'
            )}
            title={logoutLabel}
            aria-label={logoutLabel}
          >
            {loggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
          </button>
        </div>
      ) : (
        <div className={clsx('group flex items-center gap-2.5', loggingOut && 'opacity-80')}>
          <div className="avatar-gradient-border w-7 h-7 rounded-full bg-[rgba(0,180,216,0.15)] flex items-center justify-center text-[var(--brand-primary)] text-[10px] font-semibold flex-shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[var(--sidebar-user-text)] truncate leading-tight">
              {userName || 'Usuário'}
            </p>
            {loggingOut && (
              <p className="text-[10px] text-[var(--sidebar-text-muted)] truncate leading-tight">
                {
                  t(
                    'signingIn'
                  ) /* reutiliza "Entrando..." como feedback — swap para "Saindo..." se chave existir */
                }
              </p>
            )}
          </div>
          <Link
            href="/admin/config"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-[var(--sidebar-item-hover)] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-hover)] flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={tNav('settings')}
            aria-label={tNav('settings')}
          >
            <Settings size={14} />
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            aria-busy={loggingOut}
            className={clsx(
              'transition-opacity p-1 rounded-md hover:bg-[var(--sidebar-item-hover)] text-[var(--sidebar-text-muted)] hover:text-rose-400 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center',
              loggingOut
                ? 'opacity-100 cursor-wait text-rose-400'
                : 'opacity-0 group-hover:opacity-100'
            )}
            title={logoutLabel}
            aria-label={logoutLabel}
          >
            {loggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
          </button>
        </div>
      )}
    </div>
  )
}
