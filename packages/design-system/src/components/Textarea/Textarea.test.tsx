import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders textarea element', () => {
    render(<Textarea id="t1" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders label', () => {
    render(<Textarea id="t1" label="Description" />)
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('label is associated with textarea', () => {
    render(<Textarea id="t1" label="Bio" />)
    expect(screen.getByLabelText('Bio')).toBeInTheDocument()
  })

  it('renders helper text', () => {
    render(<Textarea id="t1" helperText="Max 500 chars" />)
    expect(screen.getByText('Max 500 chars')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<Textarea id="t1" error="Required field" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required field')
  })

  it('hides helper text when error is shown', () => {
    render(<Textarea id="t1" helperText="Help" error="Error" />)
    expect(screen.queryByText('Help')).not.toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('sets aria-invalid when error is present', () => {
    render(<Textarea id="t1" error="Bad" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets aria-describedby for error', () => {
    render(<Textarea id="t1" error="Err" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 't1-error')
  })

  it('sets aria-describedby for helper text', () => {
    render(<Textarea id="t1" helperText="Help" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 't1-helper')
  })

  it('applies fullWidth class by default', () => {
    const { container } = render(<Textarea id="t1" />)
    expect(container.querySelector('.ds-textarea-wrapper--full')).toBeInTheDocument()
  })

  it('does not apply fullWidth class when false', () => {
    const { container } = render(<Textarea id="t1" fullWidth={false} />)
    expect(container.querySelector('.ds-textarea-wrapper--full')).not.toBeInTheDocument()
  })

  it('applies no-resize class', () => {
    const { container } = render(<Textarea id="t1" noResize />)
    expect(container.querySelector('.ds-textarea__field--no-resize')).toBeInTheDocument()
  })

  it('disables textarea', () => {
    render(<Textarea id="t1" disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('handles change events', () => {
    const onChange = vi.fn()
    render(<Textarea id="t1" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hello' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('shows character counter', () => {
    render(<Textarea id="t1" showCount value="Hello" maxLength={100} onChange={() => {}} />)
    expect(screen.getByText('5/100')).toBeInTheDocument()
  })

  it('shows over-limit counter class', () => {
    const { container } = render(
      <Textarea id="t1" showCount value="Too long" maxLength={3} onChange={() => {}} />
    )
    expect(container.querySelector('.ds-textarea__counter--over')).toBeInTheDocument()
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(<Textarea id="t1" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('applies custom className', () => {
    const { container } = render(<Textarea id="t1" className="custom" />)
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })

  it('applies sm size class', () => {
    const { container } = render(<Textarea id="t1" size="sm" />)
    expect(container.querySelector('.ds-textarea__field--sm')).toBeInTheDocument()
  })

  it('applies lg size class', () => {
    const { container } = render(<Textarea id="t1" size="lg" />)
    expect(container.querySelector('.ds-textarea__field--lg')).toBeInTheDocument()
  })
})
