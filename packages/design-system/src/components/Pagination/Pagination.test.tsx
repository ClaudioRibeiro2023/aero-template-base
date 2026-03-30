import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={vi.fn()} />)
    expect(container.querySelector('.ds-pagination')).not.toBeInTheDocument()
  })

  it('renders navigation landmark', () => {
    render(<Pagination page={1} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
  })

  it('renders page buttons', () => {
    render(<Pagination page={1} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Page 5')).toBeInTheDocument()
  })

  it('marks active page with aria-current', () => {
    render(<Pagination page={3} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Page 3')).toHaveAttribute('aria-current', 'page')
  })

  it('active page has active class', () => {
    render(<Pagination page={2} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Page 2')).toHaveClass('ds-pagination__button--active')
  })

  it('calls onChange when page clicked', () => {
    const onChange = vi.fn()
    render(<Pagination page={1} totalPages={5} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Page 3'))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('shows prev/next buttons', () => {
    render(<Pagination page={3} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument()
    expect(screen.getByLabelText('Next page')).toBeInTheDocument()
  })

  it('disables prev button on first page', () => {
    render(<Pagination page={1} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Previous page')).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination page={5} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Next page')).toBeDisabled()
  })

  it('calls onChange with page-1 on prev click', () => {
    const onChange = vi.fn()
    render(<Pagination page={3} totalPages={5} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Previous page'))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('calls onChange with page+1 on next click', () => {
    const onChange = vi.fn()
    render(<Pagination page={3} totalPages={5} onChange={onChange} />)
    fireEvent.click(screen.getByLabelText('Next page'))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('shows ellipsis for large page counts', () => {
    const { container } = render(<Pagination page={5} totalPages={20} onChange={vi.fn()} />)
    expect(container.querySelectorAll('.ds-pagination__ellipsis').length).toBeGreaterThan(0)
  })

  it('hides prev/next when showPrevNext is false', () => {
    render(<Pagination page={1} totalPages={5} onChange={vi.fn()} showPrevNext={false} />)
    expect(screen.queryByLabelText('Previous page')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Pagination page={1} totalPages={5} onChange={vi.fn()} className="custom" />
    )
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})
