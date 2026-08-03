import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageDataFreshness } from './PageDataFreshness'

const JUN_20 = new Date(2026, 5, 20)

describe('PageDataFreshness', () => {
  it('renders the freshness stamp from a Date (pt-BR)', () => {
    render(<PageDataFreshness updatedAt={JUN_20} data-testid="fresh" />)
    expect(screen.getByText('20/06/2026')).toBeInTheDocument()
    expect(screen.getByTestId('fresh').textContent).toContain('atualizado em')
  })

  it('renders exactly one stamp (one <time>) — never repeated', () => {
    render(<PageDataFreshness updatedAt={JUN_20} data-testid="fresh" />)
    expect(screen.getByTestId('fresh').querySelectorAll('time')).toHaveLength(1)
  })

  it('defaults to the "Dados oficiais" prefix for external audience', () => {
    render(<PageDataFreshness updatedAt={JUN_20} audience="external" />)
    expect(screen.getByText('Dados oficiais')).toBeInTheDocument()
  })

  it('hides technical source as visible text for external audience but keeps it in title', () => {
    render(
      <PageDataFreshness
        updatedAt={JUN_20}
        audience="external"
        source="cadastro_interno"
        data-testid="fresh"
      />
    )
    expect(screen.queryByText(/cadastro_interno/)).not.toBeInTheDocument()
    expect(screen.getByTestId('fresh')).toHaveAttribute('title', 'cadastro_interno')
  })

  it('shows the source for internal audience', () => {
    render(<PageDataFreshness updatedAt={JUN_20} audience="internal" source="cadastro_interno" />)
    expect(screen.getByText('fonte: cadastro_interno')).toBeInTheDocument()
  })

  it('uses a pre-formatted string date as-is', () => {
    render(<PageDataFreshness updatedAt="20/06/2026 as 14h" />)
    expect(screen.getByText('20/06/2026 as 14h')).toBeInTheDocument()
  })

  it('renders a <time> with a machine-readable dateTime for a Date', () => {
    render(<PageDataFreshness updatedAt={JUN_20} data-testid="fresh" />)
    const time = screen.getByTestId('fresh').querySelector('time')
    expect(time?.getAttribute('dateTime')).toBeTruthy()
  })
})
