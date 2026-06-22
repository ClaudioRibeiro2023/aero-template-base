import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RankingPanel, type RankingItem } from './RankingPanel'

const best: RankingItem[] = [
  { label: 'Cidade Alfa', value: 98, displayValue: '98%' },
  { label: 'Cidade Beta', value: 80, displayValue: '80%' },
]
const needs: RankingItem[] = [{ label: 'Cidade Omega', value: 19, displayValue: '19%' }]

describe('RankingPanel', () => {
  it('renders both column labels', () => {
    render(<RankingPanel best={best} needs={needs} />)
    expect(screen.getByText('Melhores')).toBeInTheDocument()
    expect(screen.getByText('Mais precisam')).toBeInTheDocument()
  })

  it('supports custom column labels', () => {
    render(<RankingPanel best={best} needs={needs} bestLabel="Topo" needsLabel="Prioridade" />)
    expect(screen.getByText('Topo')).toBeInTheDocument()
    expect(screen.getByText('Prioridade')).toBeInTheDocument()
  })

  it('renders items from both columns', () => {
    render(<RankingPanel best={best} needs={needs} />)
    expect(screen.getByText('Cidade Alfa')).toBeInTheDocument()
    expect(screen.getByText('Cidade Omega')).toBeInTheDocument()
  })

  it('uses ordered lists for ranking semantics (one per column)', () => {
    render(<RankingPanel best={best} needs={needs} />)
    expect(screen.getAllByRole('list')).toHaveLength(2)
  })

  it('caps each column at the limit', () => {
    const many: RankingItem[] = Array.from({ length: 8 }, (_, i) => ({
      label: `Item ${i}`,
      value: 100 - i,
    }))
    render(<RankingPanel best={many} needs={many} limit={3} data-testid="rk" />)
    expect(screen.getByTestId('rk').querySelectorAll('.ds-ranking__item')).toHaveLength(6)
  })

  it('scales bar width as a percent when scale="percent"', () => {
    render(<RankingPanel best={best} needs={needs} scale="percent" data-testid="rk" />)
    const firstBar = screen.getByTestId('rk').querySelector('.ds-ranking__bar') as HTMLElement
    expect(firstBar.style.width).toBe('98%')
  })

  it('marks the leader item in each column', () => {
    render(<RankingPanel best={best} needs={needs} data-testid="rk" />)
    expect(screen.getByTestId('rk').querySelectorAll('.ds-ranking__item--lead')).toHaveLength(2)
  })
})
