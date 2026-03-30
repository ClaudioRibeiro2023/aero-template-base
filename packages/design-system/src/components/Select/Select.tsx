import { forwardRef, type SelectHTMLAttributes } from 'react'
import clsx from 'clsx'
import './Select.css'

export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Label */
  label?: string
  /** Texto de ajuda */
  helperText?: string
  /** Mensagem de erro */
  error?: string
  /** Tamanho */
  size?: SelectSize
  /** Largura total */
  fullWidth?: boolean
  /** Opções */
  options: SelectOption[]
  /** Placeholder */
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      fullWidth = true,
      options,
      placeholder,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const hasError = !!error

    return (
      <div className={clsx('ds-select-wrapper', fullWidth && 'ds-select-wrapper--full', className)}>
        {label && (
          <label htmlFor={id} className="ds-select__label">
            {label}
          </label>
        )}
        <div
          className={clsx(
            'ds-select__container',
            hasError && 'ds-select__container--error',
            size !== 'md' && `ds-select__container--${size}`
          )}
        >
          <select
            ref={ref}
            id={id}
            className="ds-select__field"
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {hasError ? (
          <span id={`${id}-error`} className="ds-select__error" role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span id={`${id}-helper`} className="ds-select__helper">
            {helperText}
          </span>
        ) : null}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
