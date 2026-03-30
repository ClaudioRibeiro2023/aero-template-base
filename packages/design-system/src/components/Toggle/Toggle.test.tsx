import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('renders a switch', () => {
    render(<Toggle checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('reflects checked state', () => {
    render(<Toggle checked={true} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toBeChecked()
  })

  it('reflects unchecked state', () => {
    render(<Toggle checked={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onChange when clicked', () => {
    const onChange = vi.fn()
    render(<Toggle checked={false} onChange={onChange} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('calls onChange with false when unchecking', () => {
    const onChange = vi.fn()
    render(<Toggle checked={true} onChange={onChange} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('renders label', () => {
    render(<Toggle checked={false} onChange={vi.fn()} label="Dark mode" />)
    expect(screen.getByText('Dark mode')).toBeInTheDocument()
  })

  it('label is associated with input', () => {
    render(<Toggle checked={false} onChange={vi.fn()} label="Theme" />)
    const input = screen.getByRole('switch')
    const label = input.closest('label')
    expect(label).not.toBeNull()
    expect(label!.htmlFor).toBe(input.id)
  })

  it('is disabled', () => {
    render(<Toggle checked={false} onChange={vi.fn()} disabled />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })

  it('applies disabled class', () => {
    const { container } = render(<Toggle checked={false} onChange={vi.fn()} disabled />)
    expect(container.querySelector('.ds-toggle--disabled')).toBeInTheDocument()
  })

  it('applies checked class to track', () => {
    const { container } = render(<Toggle checked={true} onChange={vi.fn()} />)
    expect(container.querySelector('.ds-toggle__track--checked')).toBeInTheDocument()
  })

  it('does not apply checked class when unchecked', () => {
    const { container } = render(<Toggle checked={false} onChange={vi.fn()} />)
    expect(container.querySelector('.ds-toggle__track--checked')).not.toBeInTheDocument()
  })

  it('applies size class', () => {
    const { container } = render(<Toggle checked={false} onChange={vi.fn()} size="lg" />)
    expect(container.querySelector('.ds-toggle__track--lg')).toBeInTheDocument()
  })

  it('applies md size by default', () => {
    const { container } = render(<Toggle checked={false} onChange={vi.fn()} />)
    expect(container.querySelector('.ds-toggle__track--md')).toBeInTheDocument()
  })

  it('has aria-checked attribute', () => {
    render(<Toggle checked={true} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('applies custom className', () => {
    const { container } = render(<Toggle checked={false} onChange={vi.fn()} className="custom" />)
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})
