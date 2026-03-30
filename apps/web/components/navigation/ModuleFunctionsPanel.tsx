'use client'

/**
 * ModuleFunctionsPanel
 *
 * Painel lateral que exibe as funções do módulo ativo.
 * Inclui busca, favoritos, recentes e agrupamento por categoria.
 *
 * Refatorado para usar configuração dinâmica via useNavigationConfig.
 * Redesign Sprint S2+S3: 100% Tailwind, slide animation, accordion animation,
 * function icons, recentes section, scrollbar-thin-light.
 */
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  Star,
  ChevronRight,
  ChevronDown,
  X,
  Keyboard,
  Clock,
  // Function icons used in navigation configs
  LayoutGrid,
  TrendingUp,
  Bell,
  FileSpreadsheet,
  ClipboardList,
  Download,
  List,
  Plus,
  Map,
  LineChart,
  Upload,
  Braces,
  Plug,
  Workflow,
  CheckCircle,
  BookMarked,
  GitBranch,
  BarChart,
  Calendar,
  History,
  Sliders,
  Palette,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  Rocket,
  Code,
  Layers,
  HelpCircle,
  FileText,
  CheckSquare,
  User,
  Cookie,
  Send,
  FileSearch,
  Users,
  UserCog,
  Building2,
  Activity,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import clsx from 'clsx'
import { useNavigationConfig } from '@/hooks/useNavigationConfig'
import type { FunctionConfig, FunctionCategory } from '@/config/navigation-schema'

// Function icon map — covers all icons used in navigation function configs
const FN_ICON_MAP: Record<string, LucideIcon> = {
  LayoutGrid,
  TrendingUp,
  Bell,
  FileSpreadsheet,
  ClipboardList,
  Download,
  List,
  Plus,
  Map,
  LineChart,
  Upload,
  Braces,
  Plug,
  Workflow,
  CheckCircle,
  BookMarked,
  GitBranch,
  BarChart,
  Calendar,
  History,
  Sliders,
  Palette,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  Rocket,
  Code,
  Layers,
  HelpCircle,
  FileText,
  CheckSquare,
  User,
  Cookie,
  Send,
  FileSearch,
  Users,
  UserCog,
  Building2,
  Activity,
  Shield,
}

function getFnIcon(iconName?: string): LucideIcon | null {
  if (!iconName) return null
  return FN_ICON_MAP[iconName] || null
}

// Nomes das categorias para exibição
const CATEGORY_LABELS: Record<FunctionCategory, string> = {
  ANALISE: 'Análise',
  MAPEAMENTO: 'Mapeamento',
  INDICADORES: 'Indicadores',
  CONTROLE: 'Controle',
  OPERACIONAL: 'Operacional',
  CONFIG: 'Configuração',
  OTHER: 'Outros',
}

// Ordem das categorias
const CATEGORY_ORDER: FunctionCategory[] = [
  'ANALISE',
  'MAPEAMENTO',
  'INDICADORES',
  'CONTROLE',
  'OPERACIONAL',
  'CONFIG',
]

// Storage keys
const FAVORITES_KEY = 'module-favorites'
const RECENTS_KEY = 'module-recents'
const MAX_RECENTS = 3

interface ModuleFunctionsPanelProps {
  isOpen?: boolean
  onClose?: () => void
  sidebarCollapsed?: boolean
  /** When true, renders inline (no fixed positioning) for mobile bottom sheet */
  mobileSheet?: boolean
}

export function ModuleFunctionsPanel({
  isOpen = true,
  onClose,
  sidebarCollapsed = false,
  mobileSheet = false,
}: ModuleFunctionsPanelProps) {
  const pathname = usePathname()

  // Usar configuração dinâmica
  const { getModuleByPath, getModuleFunctions } = useNavigationConfig()

  // Estados
  const [searchTerm, setSearchTerm] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [recents, setRecents] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(RECENTS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const [expandedCategories, setExpandedCategories] = useState<FunctionCategory[]>(CATEGORY_ORDER)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Resolver módulo ativo baseado na URL usando hook de config
  const activeModule = useMemo(() => {
    return getModuleByPath(pathname)
  }, [pathname, getModuleByPath])

  // Obter funções autorizadas do módulo ativo (já filtradas por permissão)
  const authorizedFunctions = useMemo(() => {
    if (!activeModule) return []
    return getModuleFunctions(activeModule.id)
  }, [activeModule, getModuleFunctions])

  // Track recently visited functions (Improvement C)
  useEffect(() => {
    const matchedFunc = authorizedFunctions.find(
      f => pathname === f.path || pathname.startsWith(f.path + '/')
    )
    if (matchedFunc) {
      setRecents(prev => {
        const updated = [matchedFunc.id, ...prev.filter(id => id !== matchedFunc.id)].slice(
          0,
          MAX_RECENTS
        )
        localStorage.setItem(RECENTS_KEY, JSON.stringify(updated))
        return updated
      })
    }
  }, [pathname, authorizedFunctions])

  // Recent functions resolved
  const recentFunctions = useMemo(() => {
    return recents
      .map(id => authorizedFunctions.find(f => f.id === id))
      .filter((f): f is FunctionConfig => f != null)
  }, [recents, authorizedFunctions])

  // Filtrar funções por busca e favoritos
  const filteredFunctions = useMemo(() => {
    let functions = authorizedFunctions

    // Filtrar por favoritos
    if (showFavoritesOnly) {
      functions = functions.filter(f => favorites.includes(f.id))
    }

    // Filtrar por busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      functions = functions.filter(
        f => f.name.toLowerCase().includes(term) || f.subtitle?.toLowerCase().includes(term)
      )
    }

    return functions
  }, [authorizedFunctions, searchTerm, showFavoritesOnly, favorites])

  // Agrupar funções por categoria
  const groupedFunctions = useMemo(() => {
    const groups: Record<FunctionCategory, FunctionConfig[]> = {
      ANALISE: [],
      MAPEAMENTO: [],
      INDICADORES: [],
      CONTROLE: [],
      OPERACIONAL: [],
      CONFIG: [],
      OTHER: [],
    }

    filteredFunctions.forEach(func => {
      const category = func.category || 'OTHER'
      if (groups[category]) {
        groups[category].push(func)
      } else {
        groups.OTHER.push(func)
      }
    })

    return groups
  }, [filteredFunctions])

  // Toggle favorito
  const toggleFavorite = useCallback((funcId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(funcId)
        ? prev.filter(id => id !== funcId)
        : [...prev, funcId]

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites))
      return newFavorites
    })
  }, [])

  // Toggle categoria expandida
  const toggleCategory = useCallback((category: FunctionCategory) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }, [])

  // Verificar se função está ativa
  const isActive = useCallback(
    (funcPath: string) => {
      return pathname === funcPath || pathname.startsWith(funcPath + '/')
    },
    [pathname]
  )

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('functions-search')
        searchInput?.focus()
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && e.shiftKey) {
        e.preventDefault()
        setShowFavoritesOnly(prev => !prev)
      }

      if (e.key === 'Escape') {
        setSearchTerm('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Se não há módulo ativo, não renderizar
  if (!activeModule) {
    return null
  }

  const hasAnyFunction = filteredFunctions.length > 0
  const showRecents = recentFunctions.length > 0 && !searchTerm && !showFavoritesOnly

  return (
    <aside
      className={clsx(
        'flex flex-col',
        mobileSheet
          ? 'relative w-full'
          : [
              'fixed top-0 h-screen z-40',
              'w-[var(--functions-panel-width,260px)]',
              'border-r border-[var(--border-default)]',
              'transition-all duration-300 ease-out',
              sidebarCollapsed
                ? 'left-[var(--sidebar-collapsed-width)]'
                : 'left-[var(--sidebar-width)]',
              isOpen
                ? 'translate-x-0 opacity-100'
                : '-translate-x-full opacity-0 pointer-events-none',
            ],
        'bg-[var(--surface-base)]'
      )}
    >
      {/* ── Header compact (48px) ── */}
      <div className="h-12 px-3 flex items-start justify-between gap-2 border-b border-[var(--border-default)] pt-2.5">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] leading-tight truncate">
            {activeModule.name}
          </h2>
          {activeModule.description && (
            <p className="text-[11px] text-[var(--text-secondary)] leading-tight truncate mt-0.5">
              {activeModule.description}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)] transition-colors"
            title="Fechar painel"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Search + Favorites ── */}
      <div className="px-3 py-2 flex gap-1.5 border-b border-[var(--border-default)]">
        <div className="flex-1 relative flex items-center">
          <Search
            size={14}
            className="absolute left-2 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            id="functions-search"
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={clsx(
              'w-full pl-7 pr-7 py-1.5 text-xs rounded-lg',
              'bg-[var(--surface-muted)] text-[var(--text-primary)]',
              'border border-transparent',
              'focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/20',
              'placeholder:text-[var(--text-muted)] outline-none transition-all'
            )}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-1.5 p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              title="Limpar busca"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFavoritesOnly(prev => !prev)}
          className={clsx(
            'flex-shrink-0 p-1.5 rounded-lg border transition-all',
            showFavoritesOnly
              ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
              : 'bg-[var(--surface-muted)] border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          )}
          title={showFavoritesOnly ? 'Mostrar todas' : 'Mostrar favoritos'}
        >
          <Star size={14} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* ── Functions list ── */}
      <div className="flex-1 overflow-y-auto px-2 py-1.5 scrollbar-thin-light">
        {/* Recentes section (Improvement C) */}
        {showRecents && (
          <div className="mb-2 pb-1.5 border-b border-[var(--border-default)]">
            <p className="flex items-center gap-1.5 px-2 mb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              <Clock size={10} />
              Recentes
            </p>
            <div className="flex flex-col gap-px">
              {recentFunctions.map(func => (
                <FunctionLink
                  key={`recent-${func.id}`}
                  func={func}
                  isActive={false}
                  isFavorite={favorites.includes(func.id)}
                  onToggleFavorite={() => toggleFavorite(func.id)}
                />
              ))}
            </div>
          </div>
        )}

        {!hasAnyFunction ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-[var(--text-secondary)]">
            {showFavoritesOnly ? (
              <>
                <Star size={28} className="opacity-20 mb-2" />
                <p className="text-sm font-medium">Nenhum favorito</p>
                <span className="text-xs opacity-60">Clique na estrela para favoritar</span>
              </>
            ) : searchTerm ? (
              <>
                <Search size={28} className="opacity-20 mb-2" />
                <p className="text-sm font-medium">Nenhum resultado</p>
                <span className="text-xs opacity-60">Tente outro termo</span>
              </>
            ) : (
              <>
                <ChevronRight size={28} className="opacity-20 mb-2" />
                <p className="text-sm font-medium">Sem funções</p>
                <span className="text-xs opacity-60">Módulo sem funções disponíveis</span>
              </>
            )}
          </div>
        ) : (
          <nav className="flex flex-col gap-0.5">
            {/* Funções sem categoria primeiro */}
            {groupedFunctions.OTHER.length > 0 && (
              <div className="mb-1">
                {groupedFunctions.OTHER.map(func => (
                  <FunctionLink
                    key={func.id}
                    func={func}
                    isActive={isActive(func.path)}
                    isFavorite={favorites.includes(func.id)}
                    onToggleFavorite={() => toggleFavorite(func.id)}
                  />
                ))}
              </div>
            )}

            {/* Funções agrupadas por categoria */}
            {CATEGORY_ORDER.map(category => {
              const functions = groupedFunctions[category]
              if (!functions || functions.length === 0) return null

              const isExpanded = expandedCategories.includes(category)

              return (
                <div key={category} className="mb-1">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center gap-1.5 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <span className="flex-1 text-left">{CATEGORY_LABELS[category]}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                      {functions.length}
                    </span>
                    <ChevronDown
                      size={12}
                      className={clsx(
                        'transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Bug #5: Animated accordion with max-height transition */}
                  <CategoryAccordion isExpanded={isExpanded}>
                    {functions.map(func => (
                      <FunctionLink
                        key={func.id}
                        func={func}
                        isActive={isActive(func.path)}
                        isFavorite={favorites.includes(func.id)}
                        onToggleFavorite={() => toggleFavorite(func.id)}
                      />
                    ))}
                  </CategoryAccordion>
                </div>
              )
            })}
          </nav>
        )}
      </div>

      {/* ── Footer compact (36px) ── */}
      <div className="border-t border-[var(--border-default)] px-3 py-1.5">
        <button
          onClick={() => setShowShortcuts(prev => !prev)}
          className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors rounded px-1.5 py-1"
        >
          <Keyboard size={12} />
          <span>Atalhos</span>
        </button>

        {showShortcuts && (
          <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-[var(--border-default)]">
            {[
              { keys: ['Ctrl', 'K'], label: 'Buscar' },
              { keys: ['Ctrl', 'Shift', 'F'], label: 'Favoritos' },
              { keys: ['Esc'], label: 'Limpar' },
            ].map(({ keys, label }) => (
              <div
                key={label}
                className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]"
              >
                {keys.map((k, i) => (
                  <span key={k}>
                    {i > 0 && <span className="mx-0.5">+</span>}
                    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-mono bg-[var(--surface-muted)] border border-[var(--border-default)] rounded">
                      {k}
                    </kbd>
                  </span>
                ))}
                <span className="ml-auto">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

// ── Bug #5: Animated accordion wrapper ──
function CategoryAccordion({
  isExpanded,
  children,
}: {
  isExpanded: boolean
  children: React.ReactNode
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [maxHeight, setMaxHeight] = useState<string>(isExpanded ? 'none' : '0px')

  useEffect(() => {
    if (isExpanded) {
      const el = contentRef.current
      if (el) {
        setMaxHeight(`${el.scrollHeight}px`)
        // After transition, switch to 'none' so new items don't get clipped
        const timer = setTimeout(() => setMaxHeight('none'), 250)
        return () => clearTimeout(timer)
      }
    } else {
      // Collapse: first set explicit height, then 0
      const el = contentRef.current
      if (el) {
        setMaxHeight(`${el.scrollHeight}px`)
        requestAnimationFrame(() => setMaxHeight('0px'))
      } else {
        setMaxHeight('0px')
      }
    }
  }, [isExpanded])

  return (
    <div
      ref={contentRef}
      className="flex flex-col gap-px mt-0.5 overflow-hidden transition-[max-height] duration-250 ease-out"
      style={{ maxHeight }}
    >
      {children}
    </div>
  )
}

// ── Componente de link para função (Improvement B: icons) ──
interface FunctionLinkProps {
  func: FunctionConfig
  isActive: boolean
  isFavorite: boolean
  onToggleFavorite: () => void
}

function FunctionLink({ func, isActive, isFavorite, onToggleFavorite }: FunctionLinkProps) {
  const Icon = getFnIcon(func.icon)

  return (
    <div
      className={clsx(
        'group flex items-stretch rounded-lg transition-all duration-150 relative',
        isActive ? 'bg-[var(--brand-primary)] text-white' : 'hover:bg-[var(--surface-muted)]'
      )}
    >
      {/* Active left bar */}
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white/60"
          aria-hidden="true"
        />
      )}

      <Link
        href={func.path}
        className={clsx(
          'flex-1 flex items-center gap-2 px-2.5 py-2 min-w-0 no-underline',
          isActive ? 'text-white' : 'text-[var(--text-primary)]'
        )}
      >
        {/* Improvement B: Function icon */}
        {Icon && (
          <Icon
            size={14}
            className={clsx(
              'flex-shrink-0',
              isActive ? 'text-white/70' : 'text-[var(--text-muted)]'
            )}
          />
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-px">
          <span className="text-[13px] font-medium leading-tight truncate">{func.name}</span>
          {func.subtitle && (
            <span
              className={clsx(
                'text-[11px] leading-tight truncate',
                isActive ? 'text-white/70' : 'text-[var(--text-secondary)]'
              )}
            >
              {func.subtitle}
            </span>
          )}
        </div>
        <ChevronRight
          size={12}
          className={clsx(
            'flex-shrink-0 transition-opacity',
            isActive
              ? 'text-white/50 opacity-100'
              : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100'
          )}
        />
      </Link>

      <button
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          onToggleFavorite()
        }}
        className={clsx(
          'flex-shrink-0 flex items-center justify-center w-7 transition-all',
          isFavorite
            ? 'text-amber-400 opacity-100'
            : clsx(
                'opacity-0 group-hover:opacity-100',
                isActive
                  ? 'text-white/60 hover:text-amber-300'
                  : 'text-[var(--text-muted)] hover:text-amber-400'
              )
        )}
        title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        <Star size={12} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}

export default ModuleFunctionsPanel
