import { type HTMLAttributes } from 'react'
import clsx from 'clsx'
import './Progress.css'

export type ProgressSize = 'sm' | 'md' | 'lg'
export type ProgressVariant = 'primary' | 'success' | 'warning' | 'error'

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** Valor atual (0-100) */
  value: number
  /** Valor máximo */
  max?: number
  /** Label do progresso */
  label?: string
  /** Mostrar porcentagem */
  showValue?: boolean
  /** Tamanho da barra */
  size?: ProgressSize
  /** Variante de cor */
  variant?: ProgressVariant
  /** Listras */
  striped?: boolean
  /** Animar listras */
  animated?: boolean
}

export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  variant = 'primary',
  striped = false,
  animated = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={clsx('ds-progress', className)} {...props}>
      {(label || showValue) && (
        <div className="ds-progress__label">
          {label && <span className="ds-progress__text">{label}</span>}
          {showValue && <span className="ds-progress__value">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div
        className={clsx('ds-progress__track', `ds-progress__track--${size}`)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div
          className={clsx(
            'ds-progress__bar',
            `ds-progress__bar--${variant}`,
            striped && 'ds-progress__bar--striped',
            animated && 'ds-progress__bar--animated'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default Progress
