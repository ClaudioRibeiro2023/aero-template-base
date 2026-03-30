import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardFooter } from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies elevated variant by default', () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId('card')).toHaveClass('ds-card--elevated')
  })

  it('applies outlined variant', () => {
    render(
      <Card variant="outlined" data-testid="card">
        Content
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('ds-card--outlined')
  })

  it('applies filled variant', () => {
    render(
      <Card variant="filled" data-testid="card">
        Content
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('ds-card--filled')
  })

  it('applies padding classes', () => {
    const { rerender } = render(
      <Card padding="none" data-testid="card">
        C
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('ds-card--padding-none')

    rerender(
      <Card padding="sm" data-testid="card">
        C
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('ds-card--padding-sm')

    rerender(
      <Card padding="lg" data-testid="card">
        C
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('ds-card--padding-lg')
  })

  it('applies interactive class', () => {
    render(
      <Card interactive data-testid="card">
        Content
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('ds-card--interactive')
  })

  it('renders header prop', () => {
    render(<Card header={<span>Header</span>}>Body</Card>)
    expect(screen.getByText('Header')).toBeInTheDocument()
  })

  it('renders footer prop', () => {
    render(<Card footer={<span>Footer</span>}>Body</Card>)
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Card className="my-card" data-testid="card">
        C
      </Card>
    )
    expect(screen.getByTestId('card')).toHaveClass('my-card')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<Card ref={ref}>Ref</Card>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})

describe('CardHeader', () => {
  it('renders title', () => {
    render(<CardHeader title="Title" />)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<CardHeader title="T" subtitle="Subtitle" />)
    expect(screen.getByText('Subtitle')).toBeInTheDocument()
  })

  it('renders action slot', () => {
    render(<CardHeader title="T" action={<button>Action</button>} />)
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<CardHeader>Custom content</CardHeader>)
    expect(screen.getByText('Custom content')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <CardFooter className="custom-footer" data-testid="footer">
        F
      </CardFooter>
    )
    expect(screen.getByTestId('footer')).toHaveClass('custom-footer')
  })
})
