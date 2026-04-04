/**
 * Table Component
 *
 * Tabela reutilizável com suporte a ordenação, seleção e responsividade.
 */

import {
  useState,
  type ReactNode,
  type HTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
} from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import clsx from 'clsx'
import './Table.css'

export type TableSize = 'sm' | 'md' | 'lg'
export type SortDirection = 'asc' | 'desc' | null

// Table Container
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Tamanho da tabela */
  size?: TableSize
  /** Bordas entre linhas */
  striped?: boolean
  /** Hover nas linhas */
  hoverable?: boolean
  /** Bordas */
  bordered?: boolean
  children?: ReactNode
}

/**
 * Responsive data table with optional striped rows, hover highlighting, and borders.
 * Wraps content in a scrollable container for horizontal overflow.
 *
 * @example
 * ```tsx
 * <Table striped hoverable>
 *   <TableHead>
 *     <TableRow>
 *       <TableHeaderCell sortable sortDirection={dir} onSort={() => handleSort('name')}>Nome</TableHeaderCell>
 *       <TableHeaderCell>Email</TableHeaderCell>
 *     </TableRow>
 *   </TableHead>
 *   <TableBody>
 *     {rows.map(r => (
 *       <TableRow key={r.id}>
 *         <TableCell>{r.name}</TableCell>
 *         <TableCell>{r.email}</TableCell>
 *       </TableRow>
 *     ))}
 *   </TableBody>
 * </Table>
 * ```
 */
export function Table({
  size = 'md',
  striped = false,
  hoverable = true,
  bordered = false,
  className,
  children,
  ...props
}: TableProps) {
  return (
    <div className="ds-table-container">
      <table
        className={clsx(
          'ds-table',
          `ds-table--${size}`,
          striped && 'ds-table--striped',
          hoverable && 'ds-table--hoverable',
          bordered && 'ds-table--bordered',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

/** Table `<thead>` wrapper. */
export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode
}

export function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <thead className={clsx('ds-table__head', className)} {...props}>
      {children}
    </thead>
  )
}

/** Table `<tbody>` wrapper. */
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children?: ReactNode
}

export function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody className={clsx('ds-table__body', className)} {...props}>
      {children}
    </tbody>
  )
}

/** Props for the {@link TableRow} component. */
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Linha selecionada */
  selected?: boolean
  children?: ReactNode
}

export function TableRow({ selected = false, className, children, ...props }: TableRowProps) {
  return (
    <tr
      className={clsx('ds-table__row', selected && 'ds-table__row--selected', className)}
      {...props}
    >
      {children}
    </tr>
  )
}

/** Props for the {@link TableHeaderCell} component. */
export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Permite ordenação */
  sortable?: boolean
  /** Direção atual da ordenação */
  sortDirection?: SortDirection
  /** Callback ao ordenar */
  onSort?: () => void
  children?: ReactNode
}

export function TableHeaderCell({
  sortable = false,
  sortDirection = null,
  onSort,
  className,
  children,
  ...props
}: TableHeaderCellProps) {
  const handleClick = () => {
    if (sortable && onSort) {
      onSort()
    }
  }

  return (
    <th
      className={clsx('ds-table__th', sortable && 'ds-table__th--sortable', className)}
      onClick={handleClick}
      aria-sort={
        sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : undefined
      }
      {...props}
    >
      <div className="ds-table__th-content">
        <span>{children}</span>
        {sortable && (
          <span className="ds-table__sort-icon">
            {sortDirection === 'asc' ? (
              <ChevronUp size={14} />
            ) : sortDirection === 'desc' ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronsUpDown size={14} />
            )}
          </span>
        )}
      </div>
    </th>
  )
}

// Table Cell
export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode
}

export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td className={clsx('ds-table__td', className)} {...props}>
      {children}
    </td>
  )
}

/**
 * Hook that manages column sort state and returns sorted data.
 * Cycles through: null -> asc -> desc -> null on repeated clicks of the same column.
 *
 * @param data - Array of row objects to sort.
 * @param defaultKey - Optional initial sort column key.
 * @returns Object with `sortedData`, `sortKey`, `sortDirection`, `handleSort`, and `getSortDirection`.
 */
export function useTableSort<T>(data: T[], defaultKey?: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultKey || null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      setSortDirection(prev => {
        if (prev === null) return 'asc'
        if (prev === 'asc') return 'desc'
        return null
      })
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  return {
    sortedData,
    sortKey,
    sortDirection,
    handleSort,
    getSortDirection: (key: keyof T): SortDirection => (sortKey === key ? sortDirection : null),
  }
}

export default Table
