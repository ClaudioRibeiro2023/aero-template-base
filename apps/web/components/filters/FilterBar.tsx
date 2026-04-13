/**
 * FilterBar
 *
 * Barra de filtros dinâmica que renderiza filtros baseados na configuração.
 * Integra com useFilters hook para gerenciamento de estado.
 */

import { useMemo } from 'react'
import { Filter, X, RotateCcw } from 'lucide-react'
import clsx from 'clsx'
import { useFilters, type FilterValue } from '@/hooks/useFilters'
import { useNavigationConfig } from '@/hooks/useNavigationConfig'
import type { FilterConfig } from '@/config/navigation-schema'
import { FilterSelect } from './FilterSelect'
import { FilterMultiSelect } from './FilterMultiSelect'
import { FilterSearch } from './FilterSearch'
import { FilterDateRange } from './FilterDateRange'
import { FilterToggle } from './FilterToggle'
import './filters.css'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface FilterBarProps {
  /** ID do módulo para filtrar os filtros aplicáveis */
  moduleId?: string

  /** Mostrar apenas filtros específicos */
  filterIds?: string[]

  /** Orientação da barra */
  orientation?: 'horizontal' | 'vertical'

  /** Mostrar botão de limpar */
  showClear?: boolean

  /** Mostrar contador de filtros ativos */
  showCount?: boolean

  /** Callback quando filtros mudam */
  onFiltersChange?: (values: Record<string, FilterValue>) => void

  /** Classes CSS adicionais */
  className?: string
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════

export function FilterBar({
  moduleId,
  filterIds,
  orientation = 'horizontal',
  showClear = true,
  showCount = true,
  onFiltersChange,
  className,
}: FilterBarProps) {
  const { getApplicableFilters } = useNavigationConfig()
  const filters = useFilters()

  // Obter filtros aplicáveis
  const applicableFilters = useMemo(() => {
    let available = getApplicableFilters(moduleId)

    // Filtrar por IDs específicos se fornecido
    if (filterIds && filterIds.length > 0) {
      available = available.filter(f => filterIds.includes(f.id))
    }

    return available.sort((a, b) => a.order - b.order)
  }, [moduleId, filterIds, getApplicableFilters])

  // Handler para mudança de valor
  const handleChange = (filterId: string, value: FilterValue) => {
    filters.setValue(filterId, value)
    onFiltersChange?.(filters.values)
  }

  // Handler para limpar todos
  const handleClearAll = () => {
    filters.clearAll()
    onFiltersChange?.({})
  }

  // Se não há filtros, não renderizar
  if (applicableFilters.length === 0) {
    return null
  }

  return (
    <div className={clsx('filter-bar', `filter-bar--${orientation}`, className)}>
      {/* Header com ícone e contador */}
      <div className="filter-bar__header">
        <div className="filter-bar__title">
          <Filter size={16} />
          <span>Filtros</span>
          {showCount && filters.activeCount > 0 && (
            <span className="filter-bar__count">{filters.activeCount}</span>
          )}
        </div>

        {showClear && filters.activeCount > 0 && (
          <button
            onClick={handleClearAll}
            className="filter-bar__clear"
            title="Limpar todos os filtros"
          >
            <RotateCcw size={14} />
            Limpar
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="filter-bar__filters">
        {applicableFilters.map(filter => (
          <FilterItem
            key={filter.id}
            filter={filter}
            value={filters.getValue(filter.id)}
            onChange={value => handleChange(filter.id, value)}
            onClear={() => filters.clearFilter(filter.id)}
          />
        ))}
      </div>

      {/* Filtros ativos (badges) */}
      {filters.activeCount > 0 && orientation === 'horizontal' && (
        <ActiveFilterBadges
          filters={applicableFilters}
          activeFilters={filters.activeFilters}
          onRemove={id => filters.clearFilter(id)}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: FilterItem (renderiza o tipo correto)
// ═══════════════════════════════════════════════════════════════

interface FilterItemProps {
  filter: FilterConfig
  value: FilterValue
  onChange: (value: FilterValue) => void
  onClear: () => void
}

function FilterItem({ filter, value, onChange, onClear }: FilterItemProps) {
  const commonProps = {
    id: filter.id,
    label: filter.name,
    placeholder: filter.placeholder,
    value,
    onChange,
    onClear,
  }

  switch (filter.type) {
    case 'select':
      return <FilterSelect {...commonProps} options={filter.options || []} />

    case 'multiselect':
      return <FilterMultiSelect {...commonProps} options={filter.options || []} />

    case 'search':
      return <FilterSearch {...commonProps} />

    case 'daterange':
      return <FilterDateRange {...commonProps} />

    case 'toggle':
      return <FilterToggle {...commonProps} />

    case 'date':
      return <FilterDateRange {...commonProps} singleDate />

    default:
      return <FilterSearch {...commonProps} />
  }
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: ActiveFilterBadges
// ═══════════════════════════════════════════════════════════════

interface ActiveFilterBadgesProps {
  filters: FilterConfig[]
  activeFilters: Array<{ id: string; value: FilterValue }>
  onRemove: (id: string) => void
}

function ActiveFilterBadges({ filters, activeFilters, onRemove }: ActiveFilterBadgesProps) {
  const getFilterLabel = (id: string) => {
    return filters.find(f => f.id === id)?.name || id
  }

  const formatValue = (value: FilterValue): string => {
    if (Array.isArray(value)) {
      if (value.length === 0) return ''
      if (value[0] instanceof Date) {
        const dates = value as [Date, Date]
        // Use explicit locale to avoid SSR/client mismatch from toLocaleDateString()
        return `${dates[0].toLocaleDateString('pt-BR')} - ${dates[1].toLocaleDateString('pt-BR')}`
      }
      return value.join(', ')
    }
    if (value instanceof Date) {
      return value.toLocaleDateString('pt-BR')
    }
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não'
    }
    return String(value)
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="filter-bar__active">
      {activeFilters.map(({ id, value }) => (
        <span key={id} className="filter-badge">
          <span className="filter-badge__label">{getFilterLabel(id)}:</span>
          <span className="filter-badge__value">{formatValue(value)}</span>
          <button
            onClick={() => onRemove(id)}
            className="filter-badge__remove"
            title="Remover filtro"
          >
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  )
}

export default FilterBar
