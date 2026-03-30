import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Type here" />)
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('associates label with input via htmlFor', () => {
    render(<Input label="Email" id="email" />)
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('id', 'email')
  })

  it('renders helper text', () => {
    render(<Input helperText="Enter your email" />)
    expect(screen.getByText('Enter your email')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<Input error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('hides helper text when error is shown', () => {
    render(<Input helperText="Help" error="Error" />)
    expect(screen.queryByText('Help')).not.toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('sets aria-invalid when error is present', () => {
    render(<Input error="Error" placeholder="input" />)
    expect(screen.getByPlaceholderText('input')).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-describedby for error', () => {
    render(<Input error="Error" id="test-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
  })

  it('sets aria-describedby for helper text', () => {
    render(<Input helperText="Help" id="test-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', 'test-input-helper')
  })

  it('applies error class to container', () => {
    const { container } = render(<Input error="Err" />)
    expect(container.querySelector('.ds-input__container--error')).toBeInTheDocument()
  })

  it('applies size classes', () => {
    const { container, rerender } = render(<Input size="sm" />)
    expect(container.querySelector('.ds-input__container--sm')).toBeInTheDocument()

    rerender(<Input size="lg" />)
    expect(container.querySelector('.ds-input__container--lg')).toBeInTheDocument()
  })

  it('renders left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon">L</span>} />)
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('renders right icon', () => {
    render(<Input rightIcon={<span data-testid="right-icon">R</span>} />)
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('applies fullWidth class by default', () => {
    const { container } = render(<Input />)
    expect(container.querySelector('.ds-input-wrapper--full')).toBeInTheDocument()
  })

  it('does not apply fullWidth class when false', () => {
    const { container } = render(<Input fullWidth={false} />)
    expect(container.querySelector('.ds-input-wrapper--full')).not.toBeInTheDocument()
  })

  it('disables input', () => {
    render(<Input disabled placeholder="disabled" />)
    expect(screen.getByPlaceholderText('disabled')).toBeDisabled()
  })

  it('handles change events', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} placeholder="input" />)
    fireEvent.change(screen.getByPlaceholderText('input'), { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('applies custom className', () => {
    const { container } = render(<Input className="custom-input" />)
    expect(container.querySelector('.custom-input')).toBeInTheDocument()
  })
})
