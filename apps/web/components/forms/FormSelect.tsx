import { forwardRef, type SelectHTMLAttributes } from 'react'

export interface FormSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: FormSelectOption[]
  error?: string
  hint?: string
  placeholder?: string
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, options, error, hint, placeholder, id, className = '', ...props }, ref) => {
    const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`
    const errorId = `${selectId}-error`
    const hintId = `${selectId}-hint`

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={selectId} className="text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`rounded-md border px-3 py-2 text-sm transition-colors bg-white
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'}
            focus:outline-none focus:ring-2 ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
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
        {hint && !error && (
          <p id={hintId} className="text-xs text-text-secondary">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormSelect.displayName = 'FormSelect'
export default FormSelect
