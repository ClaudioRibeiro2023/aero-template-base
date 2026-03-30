import { forwardRef, type TextareaHTMLAttributes } from 'react'

export interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
  maxLength?: number
  showCount?: boolean
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    { label, error, hint, maxLength, showCount = false, id, className = '', value, ...props },
    ref
  ) => {
    const textareaId = id || `textarea-${label.toLowerCase().replace(/\s+/g, '-')}`
    const errorId = `${textareaId}-error`
    const hintId = `${textareaId}-hint`
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={textareaId} className="text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          className={`rounded-md border px-3 py-2 text-sm transition-colors resize-y min-h-[80px]
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'}
            focus:outline-none focus:ring-2 ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        <div className="flex justify-between">
          <div>
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
          {showCount && maxLength && (
            <span className="text-xs text-text-secondary">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'
export default FormTextarea
