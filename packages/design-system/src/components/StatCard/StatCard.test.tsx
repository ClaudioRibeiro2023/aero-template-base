import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Municipios" value="628" />)
    expect(screen.getByText('Municipios')).toBeInTheDocument()
    expect(screen.getByText('628')).toBeInTheDocument()
  })

  it('renders the delta value with the direction modifier', () => {
    render(
      <StatCard
        title="Receita"
        value="R$ 2,4M"
        delta={{ value: '+8%', direction: 'up', label: 'vs ciclo' }}
        data-testid="card"
      />
    )
    expect(screen.getByText('+8%')).toBeInTheDocument()
    expect(screen.getByText('vs ciclo')).toBeInTheDocument()
    expect(screen.getByTestId('card').querySelector('.ds-stat-card__delta--up')).not.toBeNull()
  })

  it('renders the canonical info "i" trigger', () => {
    render(<StatCard title="X" value="1" info="explicacao" />)
    expect(screen.getByRole('button', { name: 'Mais informacoes' })).toBeInTheDocument()
  })

  it('renders a sparkline svg when a series is provided', () => {
    render(<StatCard title="X" value="1" sparkline={[1, 2, 3, 4]} data-testid="card" />)
    expect(screen.getByTestId('card').querySelector('svg.ds-stat-card__sparkline')).not.toBeNull()
  })

  it('does not render a sparkline for a series with fewer than 2 points', () => {
    render(<StatCard title="X" value="1" sparkline={[5]} data-testid="card" />)
    expect(screen.getByTestId('card').querySelector('svg.ds-stat-card__sparkline')).toBeNull()
  })

  it('applies the tone modifier class', () => {
    render(<StatCard title="X" value="1" tone="warning" data-testid="card" />)
    expect(screen.getByTestId('card')).toHaveClass('ds-stat-card--warning')
  })

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null }
    render(<StatCard ref={ref} title="X" value="1" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })
})
