'use client'

/**
 * CommandPalette — Busca global com navegação por teclado
 *
 * Atalho: Cmd+K (Mac) / Ctrl+K (Windows/Linux)
 * Busca: navegação estática + usuários/tickets/tasks via React Query.
 * A11y: Arrow Up/Down navega, Enter seleciona, Escape fecha.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, Headphones, CheckSquare, Navigation, Loader2, X } from 'lucide-react'
import { useGlobalSearch, type SearchResult } from '@/hooks/useGlobalSearch'

const TYPE_ICONS: Record<SearchResult['type'], React.ElementType> = {
  navigation: Navigation,
  user: Users,
  ticket: Headphones,
  task: CheckSquare,
}

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  navigation: 'Navegação',
  user: 'Usuário',
  ticket: 'Ticket',
  task: 'Task',
}

const TYPE_COLORS: Record<SearchResult['type'], string> = {
  navigation: 'var(--brand-primary)',
  user: 'var(--accent-purple)',
  ticket: 'var(--accent-amber)',
  task: 'var(--accent-emerald)',
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const { query, setQuery, results, isLoading, clear } = useGlobalSearch()
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setActiveIndex(-1)
    } else {
      clear()
      setActiveIndex(-1)
    }
  }, [isOpen, clear])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLElement>('[role="option"]')
      items[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onClose()
      router.push(result.path)
    },
    [onClose, router]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0))
        return
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1))
        return
      }

      if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault()
        handleSelect(results[activeIndex])
      }
    },
    [results, activeIndex, onClose, handleSelect]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh] p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-label="Busca global"
        aria-modal="true"
        className="w-full max-w-lg overflow-hidden"
        style={{
          background: 'rgba(24, 24, 27, 0.95)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
          animation: 'scaleIn 0.15s ease-out',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {isLoading ? (
            <Loader2 size={18} className="text-[var(--brand-primary)] animate-spin flex-shrink-0" />
          ) : (
            <Search size={18} className="text-[var(--text-muted)] flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setActiveIndex(-1)
            }}
            placeholder="Buscar páginas, usuários, tickets, tasks..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="command-palette-results"
            aria-activedescendant={activeIndex >= 0 ? `cmd-result-${activeIndex}` : undefined}
            autoComplete="off"
          />
          <div className="flex items-center gap-2">
            {query && (
              <button
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                className="p-1 rounded hover:bg-white/[0.06] text-[var(--text-muted)]"
                aria-label="Limpar busca"
              >
                <X size={14} />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] border border-[rgba(255,255,255,0.08)] rounded">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="command-palette-results"
          role="listbox"
          aria-label="Resultados da busca"
          className="max-h-[300px] overflow-y-auto"
        >
          {query.length >= 2 && results.length === 0 && !isLoading && (
            <div className="py-8 text-center">
              <Search size={24} className="mx-auto text-[var(--text-muted)] opacity-30 mb-2" />
              <p className="text-sm text-[var(--text-muted)]">Nenhum resultado encontrado</p>
              <p className="text-xs text-[var(--text-disabled)] mt-0.5">Tente termos diferentes</p>
            </div>
          )}

          {query.length < 2 && (
            <div className="py-6 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                Digite ao menos 2 caracteres para buscar
              </p>
              <div className="flex items-center justify-center gap-4 mt-3">
                {(['navigation', 'user', 'ticket', 'task'] as const).map(type => {
                  const Icon = TYPE_ICONS[type]
                  return (
                    <div
                      key={type}
                      className="flex items-center gap-1.5 text-xs text-[var(--text-disabled)]"
                    >
                      <Icon size={12} style={{ color: TYPE_COLORS[type] }} />
                      {TYPE_LABELS[type]}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {results.map((result, index) => {
            const Icon = TYPE_ICONS[result.type]
            const isActive = index === activeIndex

            return (
              <div
                key={result.id}
                id={`cmd-result-${index}`}
                role="option"
                aria-selected={isActive}
                data-active={isActive}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setActiveIndex(index)}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                }}
              >
                <div
                  className="p-1.5 rounded-lg flex-shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${TYPE_COLORS[result.type]} 10%, transparent)`,
                  }}
                >
                  <Icon size={14} style={{ color: TYPE_COLORS[result.type] }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--text-primary)] truncate">{result.title}</p>
                  {result.description && (
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {result.description}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-[var(--text-disabled)] flex-shrink-0 uppercase tracking-wider">
                  {TYPE_LABELS[result.type]}
                </span>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            background: 'rgba(255,255,255,0.01)',
          }}
        >
          <div className="flex items-center gap-3 text-[10px] text-[var(--text-disabled)]">
            <span>
              <kbd className="px-1 py-0.5 rounded border border-[rgba(255,255,255,0.08)] font-mono">
                ↑↓
              </kbd>{' '}
              navegar
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded border border-[rgba(255,255,255,0.08)] font-mono">
                ↵
              </kbd>{' '}
              abrir
            </span>
            <span>
              <kbd className="px-1 py-0.5 rounded border border-[rgba(255,255,255,0.08)] font-mono">
                esc
              </kbd>{' '}
              fechar
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-disabled)]">
            {results.length > 0 ? `${results.length} resultados` : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
