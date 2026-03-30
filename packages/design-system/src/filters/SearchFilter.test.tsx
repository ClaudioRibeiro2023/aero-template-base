import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchFilter, FilterChip } from './SearchFilter'

describe('SearchFilter', () => {
  it('renders search input', () => {
    render(<SearchFilter value="" onChange={vi.fn()} />)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<SearchFilter value="" onChange={vi.fn()} placeholder="Search users..." />)
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument()
  })

  it('renders value', () => {
    render(<SearchFilter value="hello" onChange={vi.fn()} />)
    expect(screen.getByRole('searchbox')).toHaveValue('hello')
  })

  it('calls onChange on input', () => {
    const onChange = vi.fn()
    render(<SearchFilter value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalledWith('test')
  })

  it('shows clear button when value exists', () => {
    render(<SearchFilter value="abc" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
  })

  it('hides clear button when value is empty', () => {
    render(<SearchFilter value="" onChange={vi.fn()} />)
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
  })

  it('calls onChange with empty string on clear', () => {
    const onChange = vi.fn()
    render(<SearchFilter value="abc" onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Clear search'))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('hides clear button when clearable is false', () => {
    render(<SearchFilter value="abc" onChange={vi.fn()} clearable={false} />)
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
  })

  it('has aria-label from placeholder', () => {
    render(<SearchFilter value="" onChange={vi.fn()} placeholder="Search..." />)
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-label', 'Search...')
  })
})

describe('FilterChip', () => {
  it('renders label', () => {
    render(<FilterChip label="Status: Active" />)
    expect(screen.getByText('Status: Active')).toBeInTheDocument()
  })

  it('applies active class', () => {
    const { container } = render(<FilterChip label="Active" active />)
    expect(container.querySelector('.ds-filter-chip--active')).toBeInTheDocument()
  })

  it('does not apply active class by default', () => {
    const { container } = render(<FilterChip label="A" />)
    expect(container.querySelector('.ds-filter-chip--active')).not.toBeInTheDocument()
  })

  it('renders remove button when onRemove provided', () => {
    render(<FilterChip label="Tag" onRemove={vi.fn()} />)
    expect(screen.getByLabelText('Remove Tag filter')).toBeInTheDocument()
  })

  it('calls onRemove when remove clicked', () => {
    const onRemove = vi.fn()
    render(<FilterChip label="Tag" onRemove={onRemove} />)
    fireEvent.click(screen.getByLabelText('Remove Tag filter'))
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('does not show remove button without onRemove', () => {
    render(<FilterChip label="Tag" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
