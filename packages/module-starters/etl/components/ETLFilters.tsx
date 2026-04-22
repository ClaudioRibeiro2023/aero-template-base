import { Search, Filter, X } from 'lucide-react'
import type { ETLFilter, DataSourceType, ImportStatus } from '../types'

interface ETLFiltersProps {
  filters: ETLFilter
  onChange: (filters: ETLFilter) => void
  showStatus?: boolean
}

const TYPE_OPTIONS: Array<{ value: DataSourceType | 'all'; label: string }> = [
  { value: 'all', label: 'Todos os tipos' },
  { value: 'csv', label: 'CSV / Planilha' },
  { value: 'json', label: 'JSON' },
  { value: 'shapefile', label: 'Shapefile' },
  { value: 'api', label: 'API' },
  { value: 'database', label: 'Banco de Dados' },
]

const STATUS_OPTIONS: Array<{ value: ImportStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos os status' },
  { value: 'pending', label: 'Pendente' },
  { value: 'running', label: 'Em execução' },
  { value: 'completed', label: 'Concluído' },
  { value: 'failed', label: 'Falha' },
]

export default function ETLFilters({ filters, onChange, showStatus = false }: ETLFiltersProps) {
  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.status !== 'all'

  const clearFilters = () => {
    onChange({
      search: '',
      type: 'all',
      status: 'all',
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-surface-elevated rounded-lg border border-border-default">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar..."
          value={filters.search || ''}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          className="form-input pl-9 text-sm"
        />
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-text-muted" />
        <select
          value={filters.type || 'all'}
          onChange={e => onChange({ ...filters, type: e.target.value as DataSourceType | 'all' })}
          className="form-select text-sm"
          title="Filtrar por tipo"
          aria-label="Filtrar por tipo de fonte"
        >
          {TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      {showStatus && (
        <select
          value={filters.status || 'all'}
          onChange={e => onChange({ ...filters, status: e.target.value as ImportStatus | 'all' })}
          className="form-select text-sm"
          title="Filtrar por status"
          aria-label="Filtrar por status"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
        >
          <X size={14} />
          Limpar
        </button>
      )}
    </div>
  )
}
