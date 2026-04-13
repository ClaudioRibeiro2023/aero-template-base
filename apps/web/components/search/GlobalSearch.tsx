'use client'

/**
 * GlobalSearch (Command Palette)
 *
 * Componente de busca global acionado por Ctrl+K / Cmd+K.
 * Permite buscar em modulos, funcoes, paginas e acoes rapidas.
 * Inclui comandos estaticos como fallback para navegacao rapida.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  ArrowRight,
  FileText,
  Settings,
  Home,
  Users,
  CornerDownLeft,
  LayoutDashboard,
  BarChart3,
  User,
  Shield,
} from 'lucide-react'
import clsx from 'clsx'
import { useNavigationConfig } from '@/hooks/useNavigationConfig'

// Tipos
interface SearchResult {
  id: string
  title: string
  subtitle?: string
  path: string
  icon: typeof Search
  category: 'module' | 'function' | 'page' | 'action'
  keywords?: string[]
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

// Icones por categoria (extensivel via module registry)
const CATEGORY_ICONS: Record<string, typeof Search> = {
  dashboard: Home,
  configuracoes: Settings,
  administracao: Users,
  default: FileText,
}

// Comandos estaticos — fallback para navegacao rapida independente de modulos
const STATIC_COMMANDS: SearchResult[] = [
  {
    id: 'cmd-dashboard',
    title: 'Dashboard',
    subtitle: 'Painel principal',
    path: '/dashboard',
    icon: LayoutDashboard,
    category: 'page',
    keywords: ['inicio', 'home', 'kpi', 'painel'],
  },
  {
    id: 'cmd-reports',
    title: 'Relatorios',
    subtitle: 'Analises do sistema',
    path: '/relatorios',
    icon: BarChart3,
    category: 'page',
    keywords: ['report', 'analise', 'grafico'],
  },
  {
    id: 'cmd-users',
    title: 'Usuarios',
    subtitle: 'Gestao de usuarios',
    path: '/admin/usuarios',
    icon: Users,
    category: 'page',
    keywords: ['user', 'admin', 'equipe', 'pessoas'],
  },
  {
    id: 'cmd-config',
    title: 'Configuracoes',
    subtitle: 'Parametros do sistema',
    path: '/admin/config',
    icon: Settings,
    category: 'page',
    keywords: ['settings', 'sistema', 'parametro'],
  },
  {
    id: 'cmd-config-geral',
    title: 'Configuracoes Gerais',
    subtitle: 'Nome e idioma',
    path: '/admin/config/geral',
    icon: Settings,
    category: 'page',
    keywords: ['nome', 'idioma', 'geral'],
  },
  {
    id: 'cmd-config-aparencia',
    title: 'Aparencia',
    subtitle: 'Tema e cores',
    path: '/admin/config/aparencia',
    icon: Settings,
    category: 'page',
    keywords: ['tema', 'cor', 'branding', 'logo'],
  },
  {
    id: 'cmd-profile',
    title: 'Meu Perfil',
    subtitle: 'Informacoes pessoais',
    path: '/profile',
    icon: User,
    category: 'page',
    keywords: ['perfil', 'conta', 'avatar', 'bio'],
  },
  {
    id: 'cmd-security',
    title: 'Seguranca',
    subtitle: 'Auditoria e permissoes',
    path: '/admin/config/seguranca',
    icon: Shield,
    category: 'page',
    keywords: ['seguranca', 'auditoria', 'permissao', 'log'],
  },
]

// Acoes rapidas (legacy)
const QUICK_ACTIONS: SearchResult[] = [
  {
    id: 'action-home',
    title: 'Ir para Dashboard',
    path: '/dashboard',
    icon: ArrowRight,
    category: 'action',
  },
  {
    id: 'action-config',
    title: 'Configuracoes',
    path: '/admin/config',
    icon: Settings,
    category: 'action',
  },
  {
    id: 'action-users',
    title: 'Usuarios',
    path: '/admin/usuarios',
    icon: Users,
    category: 'action',
  },
]

// Categoria labels
const CATEGORY_LABELS: Record<string, string> = {
  module: 'Modulo',
  function: 'Funcao',
  page: 'Pagina',
  action: 'Acao',
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const { authorizedModules, getModuleFunctions } = useNavigationConfig()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Construir lista de resultados pesquisaveis
  const allResults = useMemo(() => {
    const results: SearchResult[] = []
    const seenPaths = new Set<string>()

    // Adicionar modulos
    authorizedModules.forEach(module => {
      const iconKey = module.id.toLowerCase()
      if (!seenPaths.has(module.path)) {
        seenPaths.add(module.path)
        results.push({
          id: `module-${module.id}`,
          title: module.name,
          subtitle: module.description,
          path: module.path,
          icon: CATEGORY_ICONS[iconKey] || CATEGORY_ICONS.default,
          category: 'module',
        })
      }

      // Adicionar funcoes do modulo
      const functions = getModuleFunctions(module.id)
      functions.forEach(func => {
        if (!seenPaths.has(func.path)) {
          seenPaths.add(func.path)
          results.push({
            id: `func-${func.id}`,
            title: func.name,
            subtitle: `${module.name} > ${func.subtitle || ''}`,
            path: func.path,
            icon: CATEGORY_ICONS[iconKey] || CATEGORY_ICONS.default,
            category: 'function',
          })
        }
      })
    })

    // Adicionar comandos estaticos (apenas os que nao duplicam modulos)
    STATIC_COMMANDS.forEach(cmd => {
      if (!seenPaths.has(cmd.path)) {
        seenPaths.add(cmd.path)
        results.push(cmd)
      }
    })

    // Adicionar acoes rapidas (apenas os que nao duplicam)
    QUICK_ACTIONS.forEach(action => {
      if (!seenPaths.has(action.path)) {
        seenPaths.add(action.path)
        results.push(action)
      }
    })

    return results
  }, [authorizedModules, getModuleFunctions])

  // Filtrar resultados por query (inclui keywords dos comandos estaticos)
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      // Mostrar acoes rapidas e modulos principais quando nao ha busca
      return allResults.slice(0, 10)
    }

    const lowerQuery = query.toLowerCase()
    return allResults
      .filter(
        result =>
          result.title.toLowerCase().includes(lowerQuery) ||
          result.subtitle?.toLowerCase().includes(lowerQuery) ||
          result.keywords?.some(k => k.includes(lowerQuery))
      )
      .slice(0, 10)
  }, [allResults, query])

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Navigate to result
  const executeResult = useCallback(
    (result: SearchResult) => {
      router.push(result.path)
      onClose()
    },
    [router, onClose]
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredResults.length - 1))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredResults[selectedIndex]) {
            executeResult(filteredResults[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    },
    [filteredResults, selectedIndex, executeResult, onClose]
  )

  // Scroll item selecionado para view
  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const selected = list.querySelector(`[data-index="${selectedIndex}"]`)
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[91] flex items-start justify-center pt-[15vh] px-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Busca global"
          className="w-full max-w-lg rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] shadow-2xl overflow-hidden"
        >
          {/* Header com input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-default)]">
            <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              placeholder="Buscar paginas, configuracoes..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-default)] rounded">
              ESC
            </kbd>
          </div>

          {/* Resultados */}
          <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
            {filteredResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Nenhum resultado encontrado</p>
                <span className="text-xs">Tente outro termo de busca</span>
              </div>
            ) : (
              filteredResults.map((result, index) => {
                const Icon = result.icon
                return (
                  <button
                    key={result.id}
                    data-index={index}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)]'
                    )}
                    onClick={() => executeResult(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span
                      className={clsx(
                        'shrink-0',
                        index === selectedIndex
                          ? 'text-[var(--brand-primary)]'
                          : 'text-[var(--text-muted)]'
                      )}
                    >
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium truncate block">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-[var(--text-muted)] truncate block">
                          {result.subtitle}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wide shrink-0">
                      {CATEGORY_LABELS[result.category] || result.category}
                    </span>
                    {index === selectedIndex && (
                      <kbd className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                        <CornerDownLeft size={10} />
                      </kbd>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {/* Footer com atalhos */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--border-default)] text-[10px] text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-[var(--border-default)] font-mono">
                &#8593;
              </kbd>
              <kbd className="px-1 py-0.5 rounded border border-[var(--border-default)] font-mono">
                &#8595;
              </kbd>
              navegar
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-[var(--border-default)] font-mono">
                <CornerDownLeft size={10} />
              </kbd>
              abrir
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-[var(--border-default)] font-mono">
                esc
              </kbd>
              fechar
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Context para estado compartilhado da busca global ──

interface GlobalSearchContextType {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const GlobalSearchContext = createContext<GlobalSearchContextType | null>(null)

/** Provider — montar UMA VEZ no topo da app (providers.tsx ou AppLayout) */
export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K ou Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return (
    <GlobalSearchContext.Provider value={{ isOpen, open, close, toggle }}>
      {children}
    </GlobalSearchContext.Provider>
  )
}

/** Hook — consome o contexto compartilhado */
export function useGlobalSearch(): GlobalSearchContextType {
  const ctx = useContext(GlobalSearchContext)
  if (!ctx) {
    // Fallback para fora do provider (testes, SSR)
    return { isOpen: false, open: () => {}, close: () => {}, toggle: () => {} }
  }
  return ctx
}

export default GlobalSearch
