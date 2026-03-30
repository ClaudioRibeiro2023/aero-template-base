/**
 * NavigationEditor — Sprint 28
 * Drag-and-drop editor for platform navigation items.
 * Uses native HTML5 Drag & Drop API (no external lib required).
 */
import { useCallback, useRef, useState } from 'react'

// ============================================================================
// Types
// ============================================================================

export interface NavItem {
  id: string
  label: string
  path: string
  icon?: string
  enabled: boolean
  order: number
}

export interface NavigationEditorProps {
  items: NavItem[]
  onReorder: (items: NavItem[]) => void
  onToggle: (itemId: string) => void
  onAdd?: (item: Omit<NavItem, 'order'>) => void
  onRemove?: (itemId: string) => void
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function NavigationEditor({
  items,
  onReorder,
  onToggle,
  onAdd,
  onRemove,
  className = '',
}: NavigationEditorProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const dragNode = useRef<HTMLElement | null>(null)

  // --- Form state for add ---
  const [newLabel, setNewLabel] = useState('')
  const [newPath, setNewPath] = useState('')
  const [newIcon, setNewIcon] = useState('')

  const sorted = [...items].sort((a, b) => a.order - b.order)

  // ------------------------------------------------------------------
  // Drag handlers
  // ------------------------------------------------------------------

  const handleDragStart = useCallback((e: React.DragEvent<HTMLLIElement>, index: number) => {
    setDragIndex(index)
    dragNode.current = e.currentTarget
    e.dataTransfer.effectAllowed = 'move'
    // slight delay to allow the ghost to render
    requestAnimationFrame(() => {
      if (dragNode.current) dragNode.current.style.opacity = '0.4'
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverIndex(index)
  }, [])

  const handleDragEnd = useCallback(() => {
    if (dragNode.current) dragNode.current.style.opacity = '1'
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      const reordered = [...sorted]
      const [moved] = reordered.splice(dragIndex, 1)
      reordered.splice(overIndex, 0, moved)
      onReorder(reordered.map((item, idx) => ({ ...item, order: idx })))
    }
    setDragIndex(null)
    setOverIndex(null)
    dragNode.current = null
  }, [dragIndex, overIndex, sorted, onReorder])

  // ------------------------------------------------------------------
  // Add item
  // ------------------------------------------------------------------

  const handleAdd = useCallback(() => {
    if (!newLabel.trim() || !newPath.trim()) return
    onAdd?.({
      id: `nav-${Date.now()}`,
      label: newLabel.trim(),
      path: newPath.trim(),
      icon: newIcon.trim() || undefined,
      enabled: true,
    })
    setNewLabel('')
    setNewPath('')
    setNewIcon('')
    setShowAddForm(false)
  }, [newLabel, newPath, newIcon, onAdd])

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------

  return (
    <div data-testid="navigation-editor" className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Editor de Navegação</h3>
        {onAdd && (
          <button
            type="button"
            onClick={() => setShowAddForm(v => !v)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {showAddForm ? 'Cancelar' : '+ Adicionar item'}
          </button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div
          data-testid="nav-add-form"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg border border-dashed border-border-default bg-surface-muted"
        >
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Label"
            aria-label="Label do item"
            className="rounded-md border border-border-default bg-surface-elevated px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <input
            type="text"
            value={newPath}
            onChange={e => setNewPath(e.target.value)}
            placeholder="/caminho"
            aria-label="Path do item"
            className="rounded-md border border-border-default bg-surface-elevated px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newLabel.trim() || !newPath.trim()}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Adicionar
          </button>
        </div>
      )}

      {/* Items list */}
      {sorted.length === 0 ? (
        <p data-testid="nav-editor-empty" className="text-center py-8 text-sm text-text-muted">
          Nenhum item de navegação configurado
        </p>
      ) : (
        <ul role="list" className="space-y-1">
          {sorted.map((item, index) => (
            <li
              key={item.id}
              draggable
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={e => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              data-testid={`nav-item-${item.id}`}
              className={[
                'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors cursor-grab active:cursor-grabbing',
                overIndex === index && dragIndex !== null
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-border-default bg-surface-elevated',
                !item.enabled ? 'opacity-50' : '',
              ].join(' ')}
            >
              {/* Grip handle */}
              <span className="text-text-muted select-none" aria-hidden>
                ⠿
              </span>

              {/* Label & path */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{item.label}</p>
                <p className="text-xs text-text-muted truncate">{item.path}</p>
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                aria-label={item.enabled ? `Desativar ${item.label}` : `Ativar ${item.label}`}
                className={[
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  item.enabled ? 'bg-blue-600' : 'bg-surface-muted',
                ].join(' ')}
              >
                <span
                  className={[
                    'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform',
                    item.enabled ? 'translate-x-4' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>

              {/* Remove */}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remover ${item.label}`}
                  className="text-text-muted hover:text-red-500 transition-colors text-sm"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
