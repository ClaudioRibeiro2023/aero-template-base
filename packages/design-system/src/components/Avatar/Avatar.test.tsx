import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar, AvatarGroup } from './Avatar'

describe('Avatar', () => {
  it('renders with image when src is provided', () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="User" />)
    expect(screen.getByAltText('User')).toBeInTheDocument()
    expect(screen.getByAltText('User').tagName).toBe('IMG')
  })

  it('renders initials from name', () => {
    render(<Avatar name="Alice Silva" />)
    expect(screen.getByText('AS')).toBeInTheDocument()
  })

  it('renders first two characters for single name', () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByText('Al')).toBeInTheDocument()
  })

  it('renders fallback when no src or name', () => {
    render(<Avatar />)
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('renders custom fallback', () => {
    render(<Avatar fallback={<span data-testid="custom">FB</span>} />)
    expect(screen.getByTestId('custom')).toBeInTheDocument()
  })

  it('applies size class', () => {
    const { container } = render(<Avatar name="A" size="lg" />)
    expect(container.querySelector('.ds-avatar--lg')).toBeInTheDocument()
  })

  it('applies md size by default', () => {
    const { container } = render(<Avatar name="A" />)
    expect(container.querySelector('.ds-avatar--md')).toBeInTheDocument()
  })

  it('applies square shape', () => {
    const { container } = render(<Avatar name="A" shape="square" />)
    expect(container.querySelector('.ds-avatar--square')).toBeInTheDocument()
  })

  it('has img role and aria-label', () => {
    render(<Avatar name="Bob" />)
    const el = screen.getByRole('img')
    expect(el).toHaveAttribute('aria-label', 'Bob')
  })

  it('applies custom className', () => {
    const { container } = render(<Avatar name="A" className="custom" />)
    expect(container.querySelector('.custom')).toBeInTheDocument()
  })
})

describe('AvatarGroup', () => {
  it('renders all avatars', () => {
    render(
      <AvatarGroup>
        <Avatar name="A B" />
        <Avatar name="C D" />
        <Avatar name="E F" />
      </AvatarGroup>
    )
    expect(screen.getByText('AB')).toBeInTheDocument()
    expect(screen.getByText('CD')).toBeInTheDocument()
    expect(screen.getByText('EF')).toBeInTheDocument()
  })

  it('limits visible avatars when max is set', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="A B" />
        <Avatar name="C D" />
        <Avatar name="E F" />
      </AvatarGroup>
    )
    expect(screen.getByText('+1')).toBeInTheDocument()
  })
})
