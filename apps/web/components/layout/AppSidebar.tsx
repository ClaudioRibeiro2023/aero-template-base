'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@template/shared'
import {
  Home,
  User,
  Settings,
  ChevronDown,
  ChevronRight,
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
  type LucideIcon,
} from 'lucide-react'

import clsx from 'clsx'
import { useNavigationConfig } from '@/hooks/useNavigationConfig'
import { useGlobalSearch } from '@/components/search'
import { useOrganization } from '@/hooks/useOrganization'
import { TenantSwitcher } from '@/components/common/TenantSwitcher'
import { SidebarHeader } from './SidebarHeader'
import { SidebarFooter } from './SidebarFooter'

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
        aria-current={isActive ? 'page' : undefined}
        className={clsx(
          'sidebar-nav-item flex items-center gap-2.5 rounded-lg transition-all duration-150 ease-out relative',
          'text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)]',
          'hover:bg-[var(--sidebar-item-hover)]',
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
              className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-bold px-0.5 ring-2 ring-[var(--sidebar-notif-ring)]"
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
                  BADGE_COLORS[badge] ||
                    'bg-[var(--sidebar-badge-bg)] text-[var(--sidebar-badge-text)]'
                )}
              >
                {badge}
              </span>
            )}
            <ChevronRight
              size={14}
              className="opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0 text-[var(--sidebar-chevron)]"
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
  const tNav = useTranslations('nav')
  const globalSearch = useGlobalSearch()

  // Translation helpers — fallback to raw label if key missing
  const translateGroup = (g: string) => {
    const key = `groups.${g}`
    const tr = tNav(key as never) as string
    return tr && tr !== key ? tr : g
  }
  const translateModule = (id: string, fallback: string) => {
    const key = `modules.${id}`
    const tr = tNav(key as never) as string
    return tr && tr !== key ? tr : fallback
  }
  const translateFn = (id: string, fallback: string) => {
    const key = `functions.${id}`
    const tr = tNav(key as never) as string
    return tr && tr !== key ? tr : fallback
  }
  const { org, orgs, switchOrg, isLoading: isOrgLoading } = useOrganization()
  const [tooltipItem, setTooltipItem] = useState<string | null>(null)

  // Usar hook de configuração dinâmica
  const { authorizedModules, config } = useNavigationConfig()

  // Platform name & logo from config (Improvement E + S5 branding)
  const appName = config?.appName || 'Template'
  const appInitial = appName[0]?.toUpperCase() || 'T'
  const logoUrl = config?.logoUrl
  const logoCompactUrl = config?.branding?.logoCompactUrl || logoUrl

  // Converter módulos para itens de navegação (com labels i18n)
  const navItems: NavItem[] = useMemo(
    () =>
      authorizedModules
        .filter(m => m.showInSidebar !== false && m.enabled)
        .map(module => ({
          label: translateModule(module.id, module.name),
          path: module.path,
          icon: getIcon(module.icon),
          group: module.group || 'Módulos',
          badge: module.metadata?.badge as string | undefined,
          notificationCount: module.metadata?.notificationCount as number | undefined,
          children: module.functions?.map(fn => ({
            label: translateFn(fn.id, fn.name),
            path: fn.path,
            icon: fn.icon ? getIcon(fn.icon) : undefined,
          })),
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authorizedModules, tNav]
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
          className="fixed bottom-4 start-4 z-30 lg:hidden p-3 rounded-full bg-[var(--brand-primary)] text-white shadow-lg"
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
          'transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          collapsed ? 'w-[var(--sidebar-collapsed-width,56px)]' : 'w-[var(--sidebar-width)]',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* ── Header: Logo + Collapse Toggle + Quick Search ── */}
        <SidebarHeader
          collapsed={collapsed}
          onToggle={onToggle}
          appName={appName}
          appInitial={appInitial}
          logoUrl={logoUrl}
          logoCompactUrl={logoCompactUrl}
          onOpenSearch={() => globalSearch.open()}
        />

        {/* ── Tenant Switcher ── */}
        {!isOrgLoading && orgs.length > 1 && !collapsed && (
          <div className="px-2 pb-1">
            <TenantSwitcher
              tenants={orgs.map(o => ({
                id: o.id,
                name: o.name,
                slug: o.slug,
                logoUrl: o.logo_url,
              }))}
              currentTenantId={org?.id}
              onSwitch={t => switchOrg(t.id)}
              className="w-full"
            />
          </div>
        )}

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
                  {translateGroup(groupName)}
                </p>
              ) : (
                <div className="sr-only">{translateGroup(groupName)}</div>
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
                            aria-expanded={expandedModules.has(item.path)}
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
                              'hover:bg-[var(--sidebar-item-hover)]',
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
                                <span className="text-[13px] font-medium flex-1 truncate text-start">
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
                            <div className="ms-4 mt-0.5 space-y-0.5 ps-2 border-s border-[rgba(0,135,168,0.15)]">
                              {item.children!.map(child => {
                                const childActive =
                                  pathname === child.path || pathname.startsWith(child.path + '/')
                                return (
                                  <Link
                                    key={child.path}
                                    href={child.path}
                                    prefetch={groupName === 'Principal' ? undefined : false}
                                    aria-current={childActive ? 'page' : undefined}
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
                        <div className="absolute start-full top-1/2 -translate-y-1/2 ms-2 z-50 pointer-events-none">
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
        <SidebarFooter collapsed={collapsed} userName={user?.name} onLogout={logout} />
      </aside>
    </>
  )
}
