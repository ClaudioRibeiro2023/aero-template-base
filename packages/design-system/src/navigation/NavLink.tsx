import { type ReactNode, type HTMLAttributes, type AnchorHTMLAttributes } from 'react'
import clsx from 'clsx'
import './NavLink.css'

export interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Ícone à esquerda */
  icon?: ReactNode
  /** Se é a rota ativa */
  active?: boolean
  /** Desabilitado */
  disabled?: boolean
  /** Badge/counter à direita */
  badge?: ReactNode
  children: ReactNode
}

export function NavLink({
  icon,
  active = false,
  disabled = false,
  badge,
  className,
  children,
  ...props
}: NavLinkProps) {
  return (
    <a
      className={clsx(
        'ds-nav-link',
        active && 'ds-nav-link--active',
        disabled && 'ds-nav-link--disabled',
        className
      )}
      aria-current={active ? 'page' : undefined}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {icon && <span className="ds-nav-link__icon">{icon}</span>}
      <span>{children}</span>
      {badge !== undefined && <span className="ds-nav-link__badge">{badge}</span>}
    </a>
  )
}

export interface NavGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Label do grupo */
  label?: string
  children: ReactNode
}

export function NavGroup({ label, className, children, ...props }: NavGroupProps) {
  return (
    <div className={clsx('ds-nav-group', className)} role="group" aria-label={label} {...props}>
      {label && <span className="ds-nav-group__label">{label}</span>}
      {children}
    </div>
  )
}

export default NavLink
