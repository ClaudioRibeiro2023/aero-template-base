import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  useTableSort,
} from './Table'

function renderTable(props?: Partial<React.ComponentProps<typeof Table>>) {
  return render(
    <Table {...props}>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Age</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Alice</TableCell>
          <TableCell>30</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob</TableCell>
          <TableCell>25</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

describe('Table', () => {
  it('renders table element', () => {
    renderTable()
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders header cells', () => {
    renderTable()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
  })

  it('renders body cells', () => {
    renderTable()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('applies md size by default', () => {
    const { container } = renderTable()
    expect(container.querySelector('.ds-table--md')).toBeInTheDocument()
  })

  it('applies size class', () => {
    const { container } = renderTable({ size: 'sm' })
    expect(container.querySelector('.ds-table--sm')).toBeInTheDocument()
  })

  it('applies striped class', () => {
    const { container } = renderTable({ striped: true })
    expect(container.querySelector('.ds-table--striped')).toBeInTheDocument()
  })

  it('applies hoverable class by default', () => {
    const { container } = renderTable()
    expect(container.querySelector('.ds-table--hoverable')).toBeInTheDocument()
  })

  it('removes hoverable class when false', () => {
    const { container } = renderTable({ hoverable: false })
    expect(container.querySelector('.ds-table--hoverable')).not.toBeInTheDocument()
  })

  it('applies bordered class', () => {
    const { container } = renderTable({ bordered: true })
    expect(container.querySelector('.ds-table--bordered')).toBeInTheDocument()
  })

  it('wraps table in scroll container', () => {
    const { container } = renderTable()
    expect(container.querySelector('.ds-table-container')).toBeInTheDocument()
  })
})

describe('TableRow', () => {
  it('applies selected class', () => {
    render(
      <Table>
        <TableBody>
          <TableRow selected data-testid="row">
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByTestId('row')).toHaveClass('ds-table__row--selected')
  })
})

describe('TableHeaderCell', () => {
  it('renders sortable header', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell sortable>Sortable</TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>
    )
    expect(screen.getByText('Sortable').closest('th')).toHaveClass('ds-table__th--sortable')
  })

  it('calls onSort when sortable header is clicked', () => {
    const onSort = vi.fn()
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell sortable onSort={onSort}>
              Col
            </TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>
    )
    fireEvent.click(screen.getByText('Col').closest('th')!)
    expect(onSort).toHaveBeenCalledOnce()
  })

  it('sets aria-sort ascending', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell sortable sortDirection="asc">
              Col
            </TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>
    )
    expect(screen.getByText('Col').closest('th')).toHaveAttribute('aria-sort', 'ascending')
  })

  it('sets aria-sort descending', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell sortable sortDirection="desc">
              Col
            </TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>
    )
    expect(screen.getByText('Col').closest('th')).toHaveAttribute('aria-sort', 'descending')
  })

  it('has no aria-sort when sortDirection is null', () => {
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell sortable sortDirection={null}>
              Col
            </TableHeaderCell>
          </TableRow>
        </TableHead>
      </Table>
    )
    expect(screen.getByText('Col').closest('th')).not.toHaveAttribute('aria-sort')
  })
})

describe('useTableSort', () => {
  function SortTest() {
    const data = [
      { name: 'Charlie', age: 35 },
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]
    const { sortedData, sortKey, sortDirection, handleSort, getSortDirection } = useTableSort(data)

    return (
      <div>
        <button onClick={() => handleSort('name')}>Sort Name</button>
        <button onClick={() => handleSort('age')}>Sort Age</button>
        <span data-testid="key">{String(sortKey)}</span>
        <span data-testid="dir">{String(sortDirection)}</span>
        <span data-testid="name-dir">{String(getSortDirection('name'))}</span>
        <ul>
          {sortedData.map((d, i) => (
            <li key={i}>
              {d.name}-{d.age}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  it('returns unsorted data initially', () => {
    render(<SortTest />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Charlie-35')
  })

  it('sorts ascending on first click', () => {
    render(<SortTest />)
    fireEvent.click(screen.getByText('Sort Name'))
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Alice-30')
    expect(items[2]).toHaveTextContent('Charlie-35')
  })

  it('sorts descending on second click', () => {
    render(<SortTest />)
    fireEvent.click(screen.getByText('Sort Name'))
    fireEvent.click(screen.getByText('Sort Name'))
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Charlie-35')
  })

  it('resets sort on third click', () => {
    render(<SortTest />)
    fireEvent.click(screen.getByText('Sort Name'))
    fireEvent.click(screen.getByText('Sort Name'))
    fireEvent.click(screen.getByText('Sort Name'))
    expect(screen.getByTestId('dir')).toHaveTextContent('null')
  })

  it('resets to asc when switching columns', () => {
    render(<SortTest />)
    fireEvent.click(screen.getByText('Sort Name'))
    fireEvent.click(screen.getByText('Sort Age'))
    expect(screen.getByTestId('key')).toHaveTextContent('age')
    expect(screen.getByTestId('dir')).toHaveTextContent('asc')
  })
})
