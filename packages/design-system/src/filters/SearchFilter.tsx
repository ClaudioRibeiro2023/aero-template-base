import { type HTMLAttributes, type InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import clsx from 'clsx'
import './SearchFilter.css'

export interface SearchFilterProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Valor da busca */
  value: string
  /** Callback ao mudar */
  onChange: (value: string) => void
  /** Mostrar botão de limpar */
  clearable?: boolean
}

export function SearchFilter({
  value,
  onChange,
  placeholder = 'Search...',
  clearable = true,
  className,
  ...props
}: SearchFilterProps) {
  return (
    <div className={clsx('ds-search-filter__input-wrapper', className)}>
      <span className="ds-search-filter__icon">
        <Search size={16} />
      </span>
      <input
        type="search"
        className="ds-search-filter__input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        {...props}
      />
      {clearable && value && (
        <button
          type="button"
          className="ds-search-filter__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export interface FilterChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Label do filtro */
  label: string
  /** Se está ativo */
  active?: boolean
  /** Callback para remover */
  onRemove?: () => void
}

export function FilterChip({
  label,
  active = false,
  onRemove,
  className,
  ...props
}: FilterChipProps) {
  return (
    <span
      className={clsx('ds-filter-chip', active && 'ds-filter-chip--active', className)}
      {...props}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          className="ds-filter-chip__remove"
          onClick={onRemove}
          aria-label={`Remove ${label} filter`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  )
}

export default SearchFilter
