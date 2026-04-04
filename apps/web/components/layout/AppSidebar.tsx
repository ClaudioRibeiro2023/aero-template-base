'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@template/shared'
import {
  Home,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  LayoutDashboard,
  BarChart3,
  Database,
  Users,
  Shield,
  ShieldCheck,
  FileText,
  Activity,
  Search,
  Boxes,
  Gauge,
  BookOpen,
  Wrench,
  Globe,
  Zap,
  FolderOpen,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react'

import clsx from 'clsx'
import { useNavigationConfig } from '@/hooks/useNavigationConfig'
import { useGlobalSearch } from '@/components/search'

// Mapa de ícones dinâmicos — cobre todos os ícones usados em navigation configs
const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  User,
  Settings,
  LayoutGrid,
  LayoutDashboard,
  BarChart3,
  Database,
  Users,
  Shield,
  ShieldCheck,
  FileText,
  Activity,
  Boxes,
  Gauge,
  BookOpen,
  Wrench,
  Globe,
  Zap,
  FolderOpen,
  CheckCircle,
}

// Função helper para obter ícone
function getIcon(iconName?: string, FallbackIcon: LucideIcon = LayoutGrid): LucideIcon {
  if (!iconName) return FallbackIcon
  return ICON_MAP[iconName] || FallbackIcon
}

// Detect platform for shortcut display
const IS_MAC = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
const MOD_KEY = IS_MAC ? '⌘' : 'Ctrl+'

// Badge color map
const BADGE_COLORS: Record<string, string> = {
  BETA: 'bg-amber-500/15 text-amber-400/80',
  DEV: 'bg-purple-500/15 text-purple-400/80',
  NEW: 'bg-emerald-500/15 text-emerald-400/80',
}

// Ordered group list to ensure consistent rendering
const GROUP_ORDER = [
  'Principal',
  'Módulos',
  'Administração',
  'Suporte',
  'Sistema',
  'Serviços Técnicos',
]

interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  group: string
  badge?: string
  notificationCount?: number
  children?: { label: string; path: string; icon?: LucideIcon }[]
}

/** SidebarLink — Adaptive Glass nav item with translateX hover and radial glow active state */
function SidebarLink({
  href,
  isActive,
  collapsed,
  icon,
  label,
  badge,
  notificationCount,
  prefetch,
}: {
  href: string
  isActive: boolean
  collapsed: boolean
  icon: React.ReactNode
  label: string
  badge?: string
  notificationCount?: number
  /** Set to false to skip route prefetching for rarely-visited pages. Defaults to undefined (Next.js default: prefetch visible links). */
  prefetch?: boolean
}) {
  return (
    <div className="group relative">
      <Link
        href={href}
        prefetch={prefetch}
        className={clsx(
          'sidebar-nav-item flex items-center gap-2.5 rounded-lg transition-all duration-150 ease-out relative',
          'text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)]',
          'hover:bg-white/[0.04]',
          collapsed ? 'p-2 justify-center min-w-[44px] min-h-[44px]' : 'px-2.5 py-1.5',
          isActive && 'sidebar-nav-item-active bg-[rgba(0,180,216,0.12)] text-[#00b4d8]'
        )}
      >
        {isActive && (
          <span className="sidebar-active-bar top-1/2 -translate-y-1/2" aria-hidden="true" />
        )}
        <span className="relative flex-shrink-0 group-hover:text-[var(--brand-primary)] transition-colors">
          {icon}
          {notificationCount != null && notificationCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold px-0.5 ring-2 ring-[rgba(9,9,11,0.85)]"
              aria-label={`${notificationCount} notificacoes`}
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </span>
        {!collapsed && (
          <>
            <span className="text-[13px] font-medium flex-1 truncate">{label}</span>
            {badge && (
              <span
                className={clsx(
                  'text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full tracking-wide',
                  BADGE_COLORS[badge] || 'bg-white/10 text-white/50'
                )}
              >
                {badge}
              </span>
            )}
            <ChevronRight
              size={14}
              className="opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0 text-white/30"
            />
          </>
        )}
      </Link>
    </div>
  )
}

interface AppSidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  /** Controle externo do drawer mobile (usado pelo AppLayout). Quando undefined,
   *  o AppSidebar gerencia seu próprio estado mobile. */
  mobileOpen?: boolean
  onMobileToggle?: (open: boolean) => void
}

export function AppSidebar({
  collapsed = false,
  onToggle,
  mobileOpen: mobileOpenProp,
  onMobileToggle,
}: AppSidebarProps) {
  // Estado interno de drawer mobile — usado quando AppLayout não controla externamente
  const [mobileOpenInternal, setMobileOpenInternal] = useState(false)

  // Se mobileOpenProp for passado, usa o externo; senão, usa o interno
  const isMobileOpen = mobileOpenProp !== undefined ? mobileOpenProp : mobileOpenInternal

  function handleMobileToggle(open: boolean) {
    if (onMobileToggle) {
      onMobileToggle(open)
    } else {
      setMobileOpenInternal(open)
    }
  }
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const globalSearch = useGlobalSearch()
  const [tooltipItem, setTooltipItem] = useState<string | null>(null)

  // Usar hook de configuração dinâmica
  const { authorizedModules, config } = useNavigationConfig()

  // Platform name & logo from config (Improvement E + S5 branding)
  const appName = config?.appName || 'Template'
  const appInitial = appName[0]?.toUpperCase() || 'T'
  const logoUrl = config?.logoUrl
  const logoCompactUrl = config?.branding?.logoCompactUrl || logoUrl

  // Converter módulos para itens de navegação
  const navItems: NavItem[] = useMemo(
    () =>
      authorizedModules
        .filter(m => m.showInSidebar !== false && m.enabled)
        .map(module => ({
          label: module.name,
          path: module.path,
          icon: getIcon(module.icon),
          group: module.group || 'Módulos',
          badge: module.metadata?.badge as string | undefined,
          notificationCount: module.metadata?.notificationCount as number | undefined,
          children: module.functions?.map(fn => ({
            label: fn.name,
            path: fn.path,
            icon: fn.icon ? getIcon(fn.icon) : undefined,
          })),
        })),
    [authorizedModules]
  )

  // Expand/collapse state for modules with children
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  // Auto-expand the module whose path matches the current route
  useEffect(() => {
    const activeModule = navItems.find(item =>
      item.children?.some(child => pathname === child.path || pathname.startsWith(child.path + '/'))
    )
    if (activeModule) {
      setExpandedModules(prev => new Set(prev).add(activeModule.path))
    }
  }, [pathname, navItems])

  // Paths that are prefixes of other module paths need exact match
  // e.g. /admin is prefix of /admin/config, /admin/etl, etc.
  const prefixPaths = useMemo(() => {
    const paths = navItems.map(i => i.path)
    return new Set(paths.filter(p => paths.some(other => other !== p && other.startsWith(p + '/'))))
  }, [navItems])

  // Group nav items by group label (preserving order)
  const groupedItems = useMemo(() => {
    const groups = new Map<string, NavItem[]>()

    // Initialize in order
    for (const g of GROUP_ORDER) {
      const items = navItems.filter(i => i.group === g)
      if (items.length > 0) groups.set(g, items)
    }
    // Catch any group not in GROUP_ORDER
    for (const item of navItems) {
      if (!groups.has(item.group)) {
        groups.set(
          item.group,
          navItems.filter(i => i.group === item.group)
        )
      }
    }

    return groups
  }, [navItems])

  // User initials for avatar
  const userInitials = useMemo(() => {
    const name = user?.name || 'U'
    const parts = name.split(' ')
    return parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name[0].toUpperCase()
  }, [user?.name])

  return (
    <>
      {/* Mobile overlay — visível apenas quando drawer está aberto em telas pequenas */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => handleMobileToggle(false)}
          aria-hidden="true"
        />
      )}

      {/* Botão FAB mobile — visível apenas em telas pequenas, controlado internamente */}
      {mobileOpenProp === undefined && (
        <button
          className="fixed bottom-4 left-4 z-30 lg:hidden p-3 rounded-full bg-[var(--brand-primary)] text-white shadow-lg"
          onClick={() => handleMobileToggle(!isMobileOpen)}
          aria-label={isMobileOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? '✕' : '☰'}
        </button>
      )}

      <aside
        role="navigation"
        aria-label="Menu principal"
        className={clsx(
          'flex flex-col sidebar-island',
          'transition-[width,transform] duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed ? 'w-[var(--sidebar-collapsed-width,56px)]' : 'w-[var(--sidebar-width)]',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
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
            onClick={() => globalSearch.open()}
            className={clsx(
              'group w-full flex items-center gap-2 rounded-lg transition-all duration-150 ease-out',
              'bg-[rgba(255,255,255,0.03)] hover:bg-white/[0.06] border border-[rgba(255,255,255,0.06)]',
              'text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)]',
              collapsed ? 'p-2 justify-center' : 'px-2.5 py-1.5'
            )}
            title={collapsed ? `Buscar (${MOD_KEY}K)` : undefined}
            aria-label="Abrir busca global"
          >
            <Search
              size={15}
              className="flex-shrink-0 group-hover:rotate-12 transition-transform"
            />
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

        {/* ── Grouped Navigation ── */}
        <nav
          className="flex-1 py-1 px-2 overflow-y-auto scrollbar-thin"
          aria-label="Navegação por módulos"
        >
          {Array.from(groupedItems.entries()).map(([groupName, items], groupIdx) => (
            <div key={groupName} className={clsx(groupIdx > 0 && 'mt-2 pt-2')}>
              {/* Group divider + label */}
              {groupIdx > 0 && (
                <div
                  className={clsx('sidebar-divider', collapsed ? 'mx-2 mb-1.5' : 'mx-2.5 mb-1.5')}
                />
              )}
              {!collapsed ? (
                <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--sidebar-text-muted)] opacity-60 select-none">
                  {groupName}
                </p>
              ) : (
                <div className="sr-only">{groupName}</div>
              )}

              {/* Group items */}
              <ul className="space-y-0.5">
                {items.map(item => {
                  const ItemIcon = item.icon
                  const isActive = prefixPaths.has(item.path)
                    ? pathname === item.path
                    : (pathname?.startsWith(item.path) ?? false)
                  const hasChildren = item.children && item.children.length > 0

                  return (
                    <li
                      key={item.path}
                      className="relative group"
                      onMouseEnter={() => (collapsed ? setTooltipItem(item.path) : undefined)}
                      onMouseLeave={() => setTooltipItem(null)}
                    >
                      {hasChildren ? (
                        <div>
                          <button
                            onClick={() => {
                              setExpandedModules(prev => {
                                const next = new Set(prev)
                                if (next.has(item.path)) next.delete(item.path)
                                else next.add(item.path)
                                return next
                              })
                            }}
                            className={clsx(
                              'sidebar-nav-item w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 ease-out',
                              'text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)]',
                              'hover:bg-white/[0.04]',
                              collapsed
                                ? 'p-2 justify-center min-w-[44px] min-h-[44px]'
                                : 'px-2.5 py-1.5',
                              isActive && 'sidebar-nav-item-active text-[#00b4d8]'
                            )}
                          >
                            <span className="flex-shrink-0 group-hover:text-[var(--brand-primary)] transition-colors">
                              <ItemIcon size={18} aria-hidden="true" />
                            </span>
                            {!collapsed && (
                              <>
                                <span className="text-[13px] font-medium flex-1 truncate text-left">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span
                                    className={clsx(
                                      'text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full tracking-wide',
                                      BADGE_COLORS[item.badge] || 'bg-white/10 text-white/50'
                                    )}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                                <ChevronDown
                                  size={14}
                                  className={clsx(
                                    'transition-transform duration-200 text-[var(--sidebar-text-muted)] flex-shrink-0',
                                    !expandedModules.has(item.path) && '-rotate-90'
                                  )}
                                />
                              </>
                            )}
                          </button>
                          {/* Children */}
                          {!collapsed && expandedModules.has(item.path) && (
                            <div className="ml-4 mt-0.5 space-y-0.5 pl-2 border-l border-[rgba(0,135,168,0.15)]">
                              {item.children!.map(child => {
                                const childActive =
                                  pathname === child.path || pathname.startsWith(child.path + '/')
                                return (
                                  <Link
                                    key={child.path}
                                    href={child.path}
                                    prefetch={groupName === 'Principal' ? undefined : false}
                                    className={clsx(
                                      'sidebar-nav-item flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-all',
                                      childActive
                                        ? 'text-[var(--brand-primary)] font-medium bg-[var(--brand-primary)]/10'
                                        : 'text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-item-hover)]'
                                    )}
                                  >
                                    {child.label}
                                  </Link>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <SidebarLink
                          href={item.path}
                          isActive={isActive}
                          collapsed={collapsed}
                          icon={<ItemIcon size={18} aria-hidden="true" />}
                          label={item.label}
                          badge={item.badge}
                          notificationCount={item.notificationCount}
                          prefetch={groupName === 'Principal' ? undefined : false}
                        />
                      )}

                      {/* Tooltip for collapsed mode */}
                      {collapsed && tooltipItem === item.path && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none">
                          <div className="px-2.5 py-1.5 rounded-lg bg-gray-900 border border-white/10 shadow-xl whitespace-nowrap flex items-center gap-2">
                            <span className="text-xs font-medium text-white">{item.label}</span>
                            {item.badge && (
                              <span
                                className={clsx(
                                  'text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full',
                                  BADGE_COLORS[item.badge] || 'bg-white/10 text-white/50'
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                            {item.notificationCount != null && item.notificationCount > 0 && (
                              <span className="min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
                                {item.notificationCount > 99 ? '99+' : item.notificationCount}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Footer: User compact ── */}
        <div
          className={clsx(
            'border-t border-[rgba(255,255,255,0.06)]',
            collapsed ? 'p-2' : 'px-3 py-2.5'
          )}
        >
          {collapsed ? (
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="avatar-gradient-border w-7 h-7 rounded-full bg-[rgba(0,180,216,0.15)] flex items-center justify-center text-[var(--brand-primary)] text-[10px] font-semibold"
                title={user?.name || 'Usuário'}
              >
                {userInitials}
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-md hover:bg-white/[0.04] text-[var(--sidebar-text-muted)] hover:text-rose-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
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
                <p className="text-[12px] font-medium text-white/70 truncate leading-tight">
                  {user?.name || 'Usuário'}
                </p>
              </div>
              <Link
                href="/admin/config"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/[0.04] text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text-hover)] flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Configurações"
                aria-label="Configurações"
              >
                <Settings size={14} />
              </Link>
              <button
                onClick={logout}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-white/[0.04] text-[var(--sidebar-text-muted)] hover:text-rose-400 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Sair"
                aria-label="Sair"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
