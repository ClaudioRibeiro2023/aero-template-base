/**
 * FilterDateRange
 *
 * Componente de filtro para seleção de data ou período.
 */

import { Calendar, X } from 'lucide-react'
import clsx from 'clsx'
import type { FilterValue } from '@/hooks/useFilters'

interface FilterDateRangeProps {
  id: string
  label: string
  placeholder?: string
  value: FilterValue
  onChange: (value: FilterValue) => void
  onClear: () => void
  disabled?: boolean
  className?: string
  singleDate?: boolean
}

export function FilterDateRange({
  id,
  label,
  placeholder,
  value,
  onChange,
  onClear,
  disabled = false,
  className,
  singleDate = false,
}: FilterDateRangeProps) {
  // Parsing do valor
  const parseValue = () => {
    if (!value) return { start: '', end: '' }

    if (value instanceof Date) {
      return { start: formatDate(value), end: '' }
    }

    if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value as [Date, Date]
      return {
        start: start instanceof Date ? formatDate(start) : '',
        end: end instanceof Date ? formatDate(end) : '',
      }
    }

    return { start: '', end: '' }
  }

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const { start, end } = parseValue()
  const hasValue = start || end

  const handleStartChange = (dateStr: string) => {
    if (singleDate) {
      onChange(dateStr ? new Date(dateStr) : null)
    } else {
      const endDate = end ? new Date(end) : null
      const startDate = dateStr ? new Date(dateStr) : null

      if (startDate && endDate) {
        onChange([startDate, endDate])
      } else if (startDate) {
        onChange([startDate, startDate])
      } else {
        onChange(null)
      }
    }
  }

  const handleEndChange = (dateStr: string) => {
    const startDate = start ? new Date(start) : null
    const endDate = dateStr ? new Date(dateStr) : null

    if (startDate && endDate) {
      onChange([startDate, endDate])
    } else if (endDate) {
      onChange([endDate, endDate])
    } else if (startDate) {
      onChange([startDate, startDate])
    } else {
      onChange(null)
    }
  }

  return (
    <div className={clsx('filter-item', 'filter-daterange', singleDate && 'single', className)}>
      <label htmlFor={`${id}-start`} className="filter-item__label">
        {label}
      </label>

      <div className="filter-item__control">
        <Calendar size={14} className="filter-daterange__icon" />

        <div className="filter-daterange__inputs">
          <input
            type="date"
            id={`${id}-start`}
            value={start}
            onChange={e => handleStartChange(e.target.value)}
            disabled={disabled}
            className="filter-daterange__input"
            placeholder={placeholder || (singleDate ? 'Selecione' : 'Data inicial')}
            title={singleDate ? label : 'Data inicial'}
          />

          {!singleDate && (
            <>
              <span className="filter-daterange__separator">até</span>
              <input
                type="date"
                id={`${id}-end`}
                value={end}
                onChange={e => handleEndChange(e.target.value)}
                disabled={disabled}
                className="filter-daterange__input"
                placeholder="Data final"
                title="Data final"
              />
            </>
          )}
        </div>

        {hasValue && (
          <button type="button" onClick={onClear} className="filter-item__clear" title="Limpar">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

export default FilterDateRange
