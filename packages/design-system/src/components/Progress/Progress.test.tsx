import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress } from './Progress'

describe('Progress', () => {
  it('renders progressbar role', () => {
    render(<Progress value={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('sets aria-valuenow', () => {
    render(<Progress value={75} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75')
  })

  it('sets aria-valuemin and aria-valuemax', () => {
    render(<Progress value={50} max={200} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '200')
  })

  it('renders label', () => {
    render(<Progress value={50} label="Upload" />)
    expect(screen.getByText('Upload')).toBeInTheDocument()
  })

  it('shows percentage value', () => {
    render(<Progress value={75} showValue />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('clamps percentage to 0-100', () => {
    render(<Progress value={150} showValue />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('applies md size by default', () => {
    const { container } = render(<Progress value={50} />)
    expect(container.querySelector('.ds-progress__track--md')).toBeInTheDocument()
  })

  it('applies size class', () => {
    const { container } = render(<Progress value={50} size="lg" />)
    expect(container.querySelector('.ds-progress__track--lg')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    const { container } = render(<Progress value={50} />)
    expect(container.querySelector('.ds-progress__bar--primary')).toBeInTheDocument()
  })

  it('applies success variant', () => {
    const { container } = render(<Progress value={50} variant="success" />)
    expect(container.querySelector('.ds-progress__bar--success')).toBeInTheDocument()
  })

  it('applies striped class', () => {
    const { container } = render(<Progress value={50} striped />)
    expect(container.querySelector('.ds-progress__bar--striped')).toBeInTheDocument()
  })

  it('applies animated class', () => {
    const { container } = render(<Progress value={50} animated />)
    expect(container.querySelector('.ds-progress__bar--animated')).toBeInTheDocument()
  })

  it('sets bar width from value', () => {
    const { container } = render(<Progress value={60} />)
    const bar = container.querySelector('.ds-progress__bar') as HTMLElement
    expect(bar.style.width).toBe('60%')
  })

  it('has aria-label from label prop', () => {
    render(<Progress value={50} label="Downloading" />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Downloading')
  })

  it('applies custom className', () => {
    const { container } = render(<Progress value={50} className="custom" />)
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})
