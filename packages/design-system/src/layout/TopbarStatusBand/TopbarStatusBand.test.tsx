import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TopbarStatusBand } from './TopbarStatusBand'

const items = [
  { label: 'Ciclo', value: '2026 - Junho' },
  { label: 'Municipios', value: '628' },
]

describe('TopbarStatusBand', () => {
  it('renders item labels and values', () => {
    render(<TopbarStatusBand items={items} />)
    expect(screen.getByText('Ciclo')).toBeInTheDocument()
    expect(screen.getByText('2026 - Junho')).toBeInTheDocument()
    expect(screen.getByText('Municipios')).toBeInTheDocument()
    expect(screen.getByText('628')).toBeInTheDocument()
  })

  it('renders the LIVE indicator when live is set', () => {
    render(<TopbarStatusBand items={items} live />)
    expect(screen.getByText('LIVE')).toBeInTheDocument()
  })

  it('supports a custom live label', () => {
    render(<TopbarStatusBand items={items} live liveLabel="AO VIVO" />)
    expect(screen.getByText('AO VIVO')).toBeInTheDocument()
  })

  it('does not render the LIVE indicator by default', () => {
    render(<TopbarStatusBand items={items} />)
    expect(screen.queryByText('LIVE')).not.toBeInTheDocument()
  })

  it('exposes a status role', () => {
    render(<TopbarStatusBand items={items} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('applies a custom className', () => {
    render(<TopbarStatusBand items={items} className="my-band" data-testid="band" />)
    expect(screen.getByTestId('band')).toHaveClass('my-band')
  })
})
