import { useMemo, type HTMLAttributes } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import './Pagination.css'

export type PaginationSize = 'sm' | 'md' | 'lg'

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Página atual (1-indexed) */
  page: number
  /** Total de páginas */
  totalPages: number
  /** Callback ao mudar de página */
  onChange: (page: number) => void
  /** Número de páginas adjacentes visíveis */
  siblings?: number
  /** Tamanho */
  size?: PaginationSize
  /** Mostrar botões prev/next */
  showPrevNext?: boolean
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function usePaginationRange(page: number, totalPages: number, siblings: number) {
  return useMemo(() => {
    const totalSlots = siblings * 2 + 5 // siblings + first + last + current + 2 ellipsis
    if (totalPages <= totalSlots) return range(1, totalPages)

    const leftSibling = Math.max(page - siblings, 1)
    const rightSibling = Math.min(page + siblings, totalPages)
    const showLeftEllipsis = leftSibling > 2
    const showRightEllipsis = rightSibling < totalPages - 1

    if (!showLeftEllipsis && showRightEllipsis) {
      const leftCount = siblings * 2 + 3
      return [...range(1, leftCount), 'ellipsis' as const, totalPages]
    }
    if (showLeftEllipsis && !showRightEllipsis) {
      const rightCount = siblings * 2 + 3
      return [1, 'ellipsis' as const, ...range(totalPages - rightCount + 1, totalPages)]
    }
    return [
      1,
      'ellipsis' as const,
      ...range(leftSibling, rightSibling),
      'ellipsis' as const,
      totalPages,
    ]
  }, [page, totalPages, siblings])
}

export function Pagination({
  page,
  totalPages,
  onChange,
  siblings = 1,
  size = 'md',
  showPrevNext = true,
  className,
  ...props
}: PaginationProps) {
  const pages = usePaginationRange(page, totalPages, siblings)

  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Pagination"
      className={clsx('ds-pagination', `ds-pagination--${size}`, className)}
      {...props}
    >
      {showPrevNext && (
        <button
          type="button"
          className="ds-pagination__button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {pages.map((item, i) => {
        if (item === 'ellipsis') {
          return (
            <span key={`ellipsis-${i}`} className="ds-pagination__ellipsis">
              &hellip;
            </span>
          )
        }
        return (
          <button
            key={item}
            type="button"
            className={clsx(
              'ds-pagination__button',
              item === page && 'ds-pagination__button--active'
            )}
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            aria-label={`Page ${item}`}
          >
            {item}
          </button>
        )
      })}

      {showPrevNext && (
        <button
          type="button"
          className="ds-pagination__button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </nav>
  )
}

export default Pagination
