import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import './Alert.css'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

/** Props for the {@link Alert} component. */
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Color variant that controls the alert styling. @default 'info' */
  variant?: AlertVariant
  /** Bold heading text for the alert. */
  title?: string
  /** Descriptive text rendered below the title. */
  description?: ReactNode
  /** Optional icon displayed at the left edge. */
  icon?: ReactNode
  /** Action elements (buttons, links) rendered at the right side. */
  actions?: ReactNode
}

/**
 * Contextual alert banner with icon, title, description, and optional actions.
 * Renders with `role="alert"` for screen reader announcements.
 *
 * @example
 * ```tsx
 * <Alert variant="warning" title="Atencao" description="Sua sessao expira em 5 minutos." />
 * <Alert variant="error" title="Erro" actions={<Button size="sm">Tentar novamente</Button>}>
 *   Falha ao carregar dados.
 * </Alert>
 * ```
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, description, icon, actions, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('ds-alert', `ds-alert--${variant}`, className)}
        role="alert"
        {...props}
      >
        {icon && <div className="ds-alert__icon">{icon}</div>}

        <div className="ds-alert__content">
          {title && <h3 className="ds-alert__title">{title}</h3>}
          {description && <p className="ds-alert__description">{description}</p>}
          {children && <div className="ds-alert__body">{children}</div>}
        </div>

        {actions && <div className="ds-alert__actions">{actions}</div>}
      </div>
    )
  }
)

Alert.displayName = 'Alert'

export default Alert
