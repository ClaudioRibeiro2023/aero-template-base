import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb'

describe('Breadcrumb', () => {
  it('renders navigation landmark', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem current>Page</BreadcrumbItem>
      </Breadcrumb>
    )
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
  })

  it('renders items', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem current>Page</BreadcrumbItem>
      </Breadcrumb>
    )
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Page')).toBeInTheDocument()
  })

  it('renders separators between items', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
        <BreadcrumbItem current>Page</BreadcrumbItem>
      </Breadcrumb>
    )
    const separators = container.querySelectorAll('.ds-breadcrumb__separator')
    expect(separators).toHaveLength(2)
  })

  it('renders custom separator', () => {
    render(
      <Breadcrumb separator="/">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem current>Page</BreadcrumbItem>
      </Breadcrumb>
    )
    expect(screen.getByText('/')).toBeInTheDocument()
  })

  it('separator has aria-hidden', () => {
    const { container } = render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem current>Page</BreadcrumbItem>
      </Breadcrumb>
    )
    const sep = container.querySelector('.ds-breadcrumb__separator')
    expect(sep).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies custom className', () => {
    const { container } = render(
      <Breadcrumb className="custom">
        <BreadcrumbItem current>Page</BreadcrumbItem>
      </Breadcrumb>
    )
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})

describe('BreadcrumbItem', () => {
  it('renders as link when href is provided', () => {
    render(<BreadcrumbItem href="/test">Link</BreadcrumbItem>)
    const link = screen.getByRole('link', { name: 'Link' })
    expect(link).toHaveAttribute('href', '/test')
  })

  it('renders as button when no href', () => {
    render(<BreadcrumbItem>Button</BreadcrumbItem>)
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument()
  })

  it('renders as span with aria-current when current', () => {
    render(<BreadcrumbItem current>Current</BreadcrumbItem>)
    const el = screen.getByText('Current')
    expect(el).toHaveAttribute('aria-current', 'page')
    expect(el).toHaveClass('ds-breadcrumb__current')
  })
})
