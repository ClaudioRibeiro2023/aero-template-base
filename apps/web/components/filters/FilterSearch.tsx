/**
 * FilterSearch
 *
 * Componente de filtro com input de busca/texto.
 */

import { Search, X } from 'lucide-react'
import clsx from 'clsx'
import type { FilterValue } from '@/hooks/useFilters'

interface FilterSearchProps {
  id: string
  label: string
  placeholder?: string
  value: FilterValue
  onChange: (value: FilterValue) => void
  onClear: () => void
  disabled?: boolean
  className?: string
  debounceMs?: number
}

export function FilterSearch({
  id,
  label,
  placeholder = 'Buscar...',
  value,
  onChange,
  onClear,
  disabled = false,
  className,
}: FilterSearchProps) {
  const currentValue = typeof value === 'string' ? value : ''
  const hasValue = currentValue.length > 0

  return (
    <div className={clsx('filter-item', 'filter-search', className)}>
      <label htmlFor={id} className="filter-item__label">
        {label}
      </label>

      <div className="filter-item__control">
        <Search size={14} className="filter-search__icon" />

        <input
          type="text"
          id={id}
          value={currentValue}
          onChange={e => onChange(e.target.value || null)}
          placeholder={placeholder}
          disabled={disabled}
          className="filter-search__input"
        />

        {hasValue && (
          <button type="button" onClick={onClear} className="filter-item__clear" title="Limpar">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterSearch
