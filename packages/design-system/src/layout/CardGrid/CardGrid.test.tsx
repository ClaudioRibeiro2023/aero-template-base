import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardGrid } from './CardGrid'

describe('CardGrid', () => {
  it('renders children', () => {
    render(
      <CardGrid>
        <div>A</div>
        <div>B</div>
      </CardGrid>
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
  })

  it('applies the gap modifier class', () => {
    render(<CardGrid gap="lg" data-testid="grid" />)
    expect(screen.getByTestId('grid')).toHaveClass('ds-card-grid--gap-lg')
  })

  it('uses auto-fit columns by default', () => {
    render(<CardGrid data-testid="grid" />)
    expect(screen.getByTestId('grid').style.gridTemplateColumns).toContain('auto-fit')
  })

  it('uses a fixed column count when columns is a number', () => {
    render(<CardGrid columns={3} data-testid="grid" />)
    expect(screen.getByTestId('grid').style.gridTemplateColumns).toContain('repeat(3,')
  })

  it('merges a custom style', () => {
    render(<CardGrid style={{ marginTop: '8px' }} data-testid="grid" />)
    expect(screen.getByTestId('grid').style.marginTop).toBe('8px')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<CardGrid ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
