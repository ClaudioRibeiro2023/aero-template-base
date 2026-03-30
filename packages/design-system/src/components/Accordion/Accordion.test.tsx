import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Accordion } from './Accordion'

const items = [
  { value: 'a', title: 'Section A', content: 'Content A' },
  { value: 'b', title: 'Section B', content: 'Content B' },
  { value: 'c', title: 'Section C', content: 'Content C' },
]

describe('Accordion', () => {
  it('renders all item triggers', () => {
    render(<Accordion items={items} />)
    expect(screen.getByText('Section A')).toBeInTheDocument()
    expect(screen.getByText('Section B')).toBeInTheDocument()
    expect(screen.getByText('Section C')).toBeInTheDocument()
  })

  it('all items are collapsed by default', () => {
    render(<Accordion items={items} />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach(btn => {
      expect(btn).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('opens item on click', () => {
    render(<Accordion items={items} />)
    fireEvent.click(screen.getByText('Section A'))
    expect(screen.getByText('Section A').closest('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('renders content when open', () => {
    render(<Accordion items={items} defaultValue={['a']} />)
    const region = screen.getByText('Content A').closest('[role="region"]')
    expect(region).toHaveClass('ds-accordion__content--open')
  })

  it('closes other items in single mode', () => {
    render(<Accordion items={items} />)
    fireEvent.click(screen.getByText('Section A'))
    fireEvent.click(screen.getByText('Section B'))
    expect(screen.getByText('Section A').closest('button')).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.getByText('Section B').closest('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('keeps multiple items open when multiple is true', () => {
    render(<Accordion items={items} multiple />)
    fireEvent.click(screen.getByText('Section A'))
    fireEvent.click(screen.getByText('Section B'))
    expect(screen.getByText('Section A').closest('button')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Section B').closest('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('toggles item closed on second click', () => {
    render(<Accordion items={items} />)
    fireEvent.click(screen.getByText('Section A'))
    fireEvent.click(screen.getByText('Section A'))
    expect(screen.getByText('Section A').closest('button')).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('calls onChange with open values', () => {
    const onChange = vi.fn()
    render(<Accordion items={items} onChange={onChange} />)
    fireEvent.click(screen.getByText('Section A'))
    expect(onChange).toHaveBeenCalledWith(['a'])
  })

  it('works in controlled mode', () => {
    const { rerender } = render(<Accordion items={items} value={['b']} />)
    expect(screen.getByText('Section B').closest('button')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Section A').closest('button')).toHaveAttribute(
      'aria-expanded',
      'false'
    )

    rerender(<Accordion items={items} value={['a', 'c']} />)
    expect(screen.getByText('Section A').closest('button')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Section B').closest('button')).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.getByText('Section C').closest('button')).toHaveAttribute('aria-expanded', 'true')
  })

  it('disabled item cannot be opened', () => {
    const disabledItems = [
      ...items.slice(0, 2),
      { value: 'c', title: 'Section C', content: 'Content C', disabled: true },
    ]
    render(<Accordion items={disabledItems} />)
    fireEvent.click(screen.getByText('Section C'))
    expect(screen.getByText('Section C').closest('button')).toHaveAttribute(
      'aria-expanded',
      'false'
    )
  })

  it('trigger has aria-controls pointing to region', () => {
    render(<Accordion items={items} defaultValue={['a']} />)
    const trigger = screen.getByText('Section A').closest('button')!
    const panelId = trigger.getAttribute('aria-controls')!
    expect(document.getElementById(panelId)).not.toBeNull()
    expect(document.getElementById(panelId)?.getAttribute('role')).toBe('region')
  })

  it('region has aria-labelledby pointing to trigger', () => {
    render(<Accordion items={items} defaultValue={['a']} />)
    const trigger = screen.getByText('Section A').closest('button')!
    const panelId = trigger.getAttribute('aria-controls')!
    const panel = document.getElementById(panelId)!
    expect(panel.getAttribute('aria-labelledby')).toBe(trigger.id)
  })

  it('applies custom className', () => {
    const { container } = render(<Accordion items={items} className="custom" />)
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})
