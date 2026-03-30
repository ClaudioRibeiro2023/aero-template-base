import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
  })

  it('has tooltip role element', () => {
    render(
      <Tooltip content="Help">
        <span>Target</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('tooltip is hidden by default', () => {
    render(
      <Tooltip content="Tip">
        <span>T</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip')).not.toHaveClass('ds-tooltip--visible')
  })

  it('shows tooltip on mouse enter', () => {
    render(
      <Tooltip content="Tip" delay={0}>
        <span>T</span>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('T').parentElement!)
    expect(screen.getByRole('tooltip')).toHaveClass('ds-tooltip--visible')
  })

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tip" delay={0}>
        <span>T</span>
      </Tooltip>
    )
    const wrapper = screen.getByText('T').parentElement!
    fireEvent.mouseEnter(wrapper)
    fireEvent.mouseLeave(wrapper)
    expect(screen.getByRole('tooltip')).not.toHaveClass('ds-tooltip--visible')
  })

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Tip" delay={0}>
        <span>T</span>
      </Tooltip>
    )
    fireEvent.focus(screen.getByText('T').parentElement!)
    expect(screen.getByRole('tooltip')).toHaveClass('ds-tooltip--visible')
  })

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Tip" delay={0}>
        <span>T</span>
      </Tooltip>
    )
    const wrapper = screen.getByText('T').parentElement!
    fireEvent.focus(wrapper)
    fireEvent.blur(wrapper)
    expect(screen.getByRole('tooltip')).not.toHaveClass('ds-tooltip--visible')
  })

  it('applies position class top by default', () => {
    render(
      <Tooltip content="Tip">
        <span>T</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip')).toHaveClass('ds-tooltip--top')
  })

  it('applies position class bottom', () => {
    render(
      <Tooltip content="Tip" position="bottom">
        <span>T</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip')).toHaveClass('ds-tooltip--bottom')
  })

  it('applies position class left', () => {
    render(
      <Tooltip content="Tip" position="left">
        <span>T</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip')).toHaveClass('ds-tooltip--left')
  })

  it('applies position class right', () => {
    render(
      <Tooltip content="Tip" position="right">
        <span>T</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip')).toHaveClass('ds-tooltip--right')
  })

  it('does not show when disabled', () => {
    render(
      <Tooltip content="Tip" disabled delay={0}>
        <span>T</span>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('T').parentElement!)
    expect(screen.getByRole('tooltip')).not.toHaveClass('ds-tooltip--visible')
  })

  it('renders tooltip content text', () => {
    render(
      <Tooltip content="My help text">
        <span>T</span>
      </Tooltip>
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent('My help text')
  })

  it('applies custom className', () => {
    const { container } = render(
      <Tooltip content="T" className="custom">
        <span>T</span>
      </Tooltip>
    )
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})
