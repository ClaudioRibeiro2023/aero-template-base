import { Children, type ReactNode, type HTMLAttributes } from 'react'
import { ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import './Breadcrumb.css'

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Separador customizado */
  separator?: ReactNode
  children: ReactNode
}

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

export interface BreadcrumbItemProps extends HTMLAttributes<HTMLElement> {
  /** URL do link (se fornecido, renderiza <a>) */
  href?: string
  /** Se é a página atual */
  current?: boolean
  children: ReactNode
}

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
