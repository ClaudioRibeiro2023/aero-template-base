import { useId, type HTMLAttributes } from 'react'
import clsx from 'clsx'
import './Toggle.css'

export type ToggleSize = 'sm' | 'md' | 'lg'

export interface ToggleProps extends Omit<HTMLAttributes<HTMLLabelElement>, 'onChange'> {
  /** Estado do toggle */
  checked: boolean
  /** Callback ao mudar */
  onChange: (checked: boolean) => void
  /** Label do toggle */
  label?: string
  /** Tamanho */
  size?: ToggleSize
  /** Desabilitado */
  disabled?: boolean
}

export function Toggle({
  checked,
  onChange,
  label,
  size = 'md',
  disabled = false,
  className,
  ...props
}: ToggleProps) {
  const id = useId()

  return (
    <label
      className={clsx('ds-toggle', disabled && 'ds-toggle--disabled', className)}
      htmlFor={id}
      {...props}
    >
      <input
        id={id}
        type="checkbox"
        className="ds-toggle__input"
        role="switch"
        checked={checked}
        onChange={e => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        aria-checked={checked}
      />
      <span
        className={clsx(
          'ds-toggle__track',
          `ds-toggle__track--${size}`,
          checked && 'ds-toggle__track--checked'
        )}
      >
        <span className="ds-toggle__thumb" />
      </span>
      {label && <span className="ds-toggle__label">{label}</span>}
    </label>
  )
}

export default Toggle
