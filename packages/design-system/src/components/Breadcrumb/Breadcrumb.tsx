import { Children, type ReactNode, type HTMLAttributes } from 'react'
import { ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import './Breadcrumb.css'

/** Props for the {@link Breadcrumb} component. */
export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Custom separator element between items. Defaults to a ChevronRight icon. */
  separator?: ReactNode
  /** One or more {@link BreadcrumbItem} elements. */
  children: ReactNode
}

/**
 * Navigation breadcrumb trail with automatic separators between items.
 * Renders a `<nav>` with `aria-label="Breadcrumb"` for accessibility.
 *
 * @example
 * ```tsx
 * <Breadcrumb>
 *   <BreadcrumbItem href="/">Inicio</BreadcrumbItem>
 *   <BreadcrumbItem href="/usuarios">Usuarios</BreadcrumbItem>
 *   <BreadcrumbItem current>Editar</BreadcrumbItem>
 * </Breadcrumb>
 * ```
 */
export function Breadcrumb({ separator, className, children, ...props }: BreadcrumbProps) {
  const items = Children.toArray(children)
  const sep = separator || <ChevronRight size={14} />

  return (
    <nav aria-label="Breadcrumb" className={clsx('ds-breadcrumb', className)} {...props}>
      {items.map((child, i) => (
        <span key={i} className="ds-breadcrumb__item">
          {child}
          {i < items.length - 1 && (
            <span className="ds-breadcrumb__separator" aria-hidden="true">
              {sep}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}

/** Props for the {@link BreadcrumbItem} component. */
export interface BreadcrumbItemProps extends HTMLAttributes<HTMLElement> {
  /** URL for the breadcrumb link. When provided, renders an `<a>` tag. */
  href?: string
  /** Marks this item as the current page (renders as `<span>` with `aria-current="page"`). @default false */
  current?: boolean
  /** Label text or content for this breadcrumb step. */
  children: ReactNode
}

/**
 * Individual breadcrumb step. Renders as a link (`<a>`), button, or static text
 * depending on whether `href` or `current` is provided.
 */
export function BreadcrumbItem({
  href,
  current = false,
  className,
  children,
  ...props
}: BreadcrumbItemProps) {
  if (current) {
    return (
      <span className={clsx('ds-breadcrumb__current', className)} aria-current="page" {...props}>
        {children}
      </span>
    )
  }

  if (href) {
    return (
      <a href={href} className={clsx('ds-breadcrumb__link', className)} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" className={clsx('ds-breadcrumb__link', className)} {...props}>
      {children}
    </button>
  )
}

export default Breadcrumb
