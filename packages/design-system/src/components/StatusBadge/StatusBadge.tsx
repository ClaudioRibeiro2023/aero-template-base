import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import './StatusBadge.css'

export type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'pending'
export type StatusBadgeSize = 'sm' | 'md'

/** Props for the {@link StatusBadge} component. */
export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Color variant indicating the status type. @default 'info' */
  variant?: StatusBadgeVariant
  /** Badge size. @default 'md' */
  size?: StatusBadgeSize
  /** Optional icon rendered to the left of the label. */
  icon?: ReactNode
}

/**
 * Colored badge for displaying entity status (e.g. active, pending, error).
 * Supports an optional leading icon and two size variants.
 *
 * @example
 * ```tsx
 * <StatusBadge variant="success">Ativo</StatusBadge>
 * <StatusBadge variant="error" icon={<AlertCircle size={14} />}>Falhou</StatusBadge>
 * ```
 */
export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ variant = 'info', size = 'md', icon, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'ds-status-badge',
          `ds-status-badge--${variant}`,
          `ds-status-badge--${size}`,
          className
        )}
        {...props}
      >
        {icon && (
          <span className="ds-status-badge__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="ds-status-badge__label">{children}</span>
      </span>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

export default StatusBadge
