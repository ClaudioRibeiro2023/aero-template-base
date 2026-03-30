/**
 * FilterSelect
 *
 * Componente de filtro dropdown com seleção única.
 */

import { ChevronDown, X } from 'lucide-react'
import clsx from 'clsx'
import type { FilterValue } from '@/hooks/useFilters'
import type { FilterOption } from '@/config/navigation-schema'

interface FilterSelectProps {
  id: string
  label: string
  placeholder?: string
  options: FilterOption[]
  value: FilterValue
  onChange: (value: FilterValue) => void
  onClear: () => void
  disabled?: boolean
  className?: string
}

export function FilterSelect({
  id,
  label,
  placeholder = 'Selecione...',
  options,
  value,
  onChange,
  onClear,
  disabled = false,
  className,
}: FilterSelectProps) {
  const currentValue = typeof value === 'string' ? value : ''
  const hasValue = currentValue && currentValue !== 'all'

  return (
    <div className={clsx('filter-item', 'filter-select', className)}>
      <label htmlFor={id} className="filter-item__label">
        {label}
      </label>

      <div className="filter-item__control">
        <select
          id={id}
          value={currentValue}
          onChange={e => onChange(e.target.value || null)}
          disabled={disabled}
          className="filter-select__input"
          title={label}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown size={14} className="filter-select__chevron" />

        {hasValue && (
          <button type="button" onClick={onClear} className="filter-item__clear" title="Limpar">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterSelect
