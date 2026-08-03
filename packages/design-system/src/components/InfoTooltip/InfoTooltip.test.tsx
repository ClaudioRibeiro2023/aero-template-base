import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InfoTooltip, InfoPopover } from './InfoTooltip'

describe('InfoTooltip', () => {
  it('renders the default "i" trigger with an accessible name', () => {
    render(<InfoTooltip content="dica" />)
    expect(screen.getByRole('button', { name: 'Mais informacoes' })).toBeInTheDocument()
  })

  it('supports a custom accessible label', () => {
    render(<InfoTooltip content="dica" label="Detalhes da metrica" />)
    expect(screen.getByRole('button', { name: 'Detalhes da metrica' })).toBeInTheDocument()
  })

  it('uses a custom trigger when children are provided', () => {
    render(
      <InfoTooltip content="dica">
        <button>gatilho custom</button>
      </InfoTooltip>
    )
    expect(screen.getByRole('button', { name: 'gatilho custom' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mais informacoes' })).not.toBeInTheDocument()
  })

  it('applies className to the default trigger', () => {
    render(<InfoTooltip content="dica" className="my-trigger" />)
    expect(screen.getByRole('button', { name: 'Mais informacoes' })).toHaveClass('my-trigger')
  })
})

describe('InfoPopover', () => {
  it('renders the default "i" trigger with an accessible name', () => {
    render(<InfoPopover content="conteudo" />)
    expect(screen.getByRole('button', { name: 'Mais informacoes' })).toBeInTheDocument()
  })

  it('opens rich content (title + body) on click', () => {
    render(<InfoPopover title="Como calculamos" content={<p>razao entre area e referencia</p>} />)
    expect(screen.queryByText('Como calculamos')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mais informacoes' }))
    expect(screen.getByText('Como calculamos')).toBeInTheDocument()
    expect(screen.getByText('razao entre area e referencia')).toBeInTheDocument()
  })

  it('renders a close button when showClose is set', () => {
    render(<InfoPopover content="x" showClose />)
    fireEvent.click(screen.getByRole('button', { name: 'Mais informacoes' }))
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeInTheDocument()
  })
})
