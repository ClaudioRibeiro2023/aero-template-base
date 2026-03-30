import { forwardRef, type TextareaHTMLAttributes } from 'react'
import clsx from 'clsx'
import './Textarea.css'

export type TextareaSize = 'sm' | 'md' | 'lg'

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Label */
  label?: string
  /** Texto de ajuda */
  helperText?: string
  /** Mensagem de erro */
  error?: string
  /** Tamanho */
  size?: TextareaSize
  /** Largura total */
  fullWidth?: boolean
  /** Desabilitar resize */
  noResize?: boolean
  /** Limite de caracteres */
  maxLength?: number
  /** Mostrar contador */
  showCount?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      fullWidth = true,
      noResize = false,
      maxLength,
      showCount = false,
      className,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const hasError = !!error
    const charCount = typeof value === 'string' ? value.length : 0
    const isOver = maxLength ? charCount > maxLength : false

    return (
      <div
        className={clsx('ds-textarea-wrapper', fullWidth && 'ds-textarea-wrapper--full', className)}
      >
        {label && (
          <label htmlFor={id} className="ds-textarea__label">
            {label}
          </label>
        )}
        <div
          className={clsx('ds-textarea__container', hasError && 'ds-textarea__container--error')}
        >
          <textarea
            ref={ref}
            id={id}
            className={clsx(
              'ds-textarea__field',
              size !== 'md' && `ds-textarea__field--${size}`,
              noResize && 'ds-textarea__field--no-resize'
            )}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            maxLength={maxLength}
            value={value}
            {...props}
          />
        </div>
        {hasError ? (
          <span id={`${id}-error`} className="ds-textarea__error" role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span id={`${id}-helper`} className="ds-textarea__helper">
            {helperText}
          </span>
        ) : null}
        {showCount && (
          <span className={clsx('ds-textarea__counter', isOver && 'ds-textarea__counter--over')}>
            {charCount}
            {maxLength ? `/${maxLength}` : ''}
          </span>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
export default Textarea
