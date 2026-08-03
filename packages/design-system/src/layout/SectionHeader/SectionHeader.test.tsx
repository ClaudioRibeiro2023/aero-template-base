import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SectionHeader } from './SectionHeader'

describe('SectionHeader', () => {
  it('renders eyebrow, title and subtitle', () => {
    render(
      <SectionHeader
        eyebrow="Diagnostico"
        title="Saude do programa"
        subtitle="No ciclo corrente."
      />
    )
    expect(screen.getByText('Diagnostico')).toBeInTheDocument()
    expect(screen.getByText('Saude do programa')).toBeInTheDocument()
    expect(screen.getByText('No ciclo corrente.')).toBeInTheDocument()
  })

  it('renders the title as a real heading (h2 by default)', () => {
    render(<SectionHeader eyebrow="Eyebrow" title="Titulo" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Titulo' })).toBeInTheDocument()
  })

  it('does not render the eyebrow as a heading', () => {
    render(<SectionHeader eyebrow="Eyebrow" title="Titulo" />)
    expect(screen.queryByRole('heading', { name: 'Eyebrow' })).not.toBeInTheDocument()
  })

  it('renders the configured heading level', () => {
    render(<SectionHeader title="Titulo" as={1} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Titulo' })).toBeInTheDocument()
  })

  it('renders the actions slot', () => {
    render(<SectionHeader title="T" actions={<button>Exportar</button>} />)
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument()
  })

  it('applies the size modifier class', () => {
    render(<SectionHeader title="T" size="xl" data-testid="sh" />)
    expect(screen.getByTestId('sh')).toHaveClass('ds-section-header--xl')
  })
})
