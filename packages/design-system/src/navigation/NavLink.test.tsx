import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Home, Settings } from 'lucide-react'
import { NavLink, NavGroup } from './NavLink'

describe('NavLink', () => {
  it('renders as a link', () => {
    render(<NavLink href="/home">Home</NavLink>)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
  })

  it('renders with href', () => {
    render(<NavLink href="/dash">Dashboard</NavLink>)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dash')
  })

  it('renders icon', () => {
    render(
      <NavLink href="/" icon={<Home data-testid="icon" size={16} />}>
        Home
      </NavLink>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('applies active class and aria-current', () => {
    render(
      <NavLink href="/" active>
        Home
      </NavLink>
    )
    const link = screen.getByRole('link')
    expect(link).toHaveClass('ds-nav-link--active')
    expect(link).toHaveAttribute('aria-current', 'page')
  })

  it('does not apply active class when inactive', () => {
    render(<NavLink href="/">Home</NavLink>)
    expect(screen.getByRole('link')).not.toHaveClass('ds-nav-link--active')
  })

  it('applies disabled class', () => {
    render(
      <NavLink href="/" disabled>
        Home
      </NavLink>
    )
    expect(screen.getByRole('link')).toHaveClass('ds-nav-link--disabled')
  })

  it('renders badge', () => {
    render(
      <NavLink href="/" badge={5}>
        Messages
      </NavLink>
    )
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <NavLink href="/" className="custom">
        Home
      </NavLink>
    )
    expect(screen.getByRole('link')).toHaveClass('custom')
  })
})

describe('NavGroup', () => {
  it('renders group with label', () => {
    render(
      <NavGroup label="Main">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/settings" icon={<Settings size={16} />}>
          Settings
        </NavLink>
      </NavGroup>
    )
    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Main' })).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <NavGroup label="Nav">
        <NavLink href="/a">A</NavLink>
        <NavLink href="/b">B</NavLink>
      </NavGroup>
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('renders without label', () => {
    const { container } = render(
      <NavGroup>
        <NavLink href="/">Home</NavLink>
      </NavGroup>
    )
    expect(container.querySelector('.ds-nav-group__label')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <NavGroup className="custom">
        <NavLink href="/">X</NavLink>
      </NavGroup>
    )
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})
