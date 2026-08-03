import type { Meta, StoryObj } from '@storybook/react'
import { RankingPanel, type RankingItem } from './RankingPanel'

const best: RankingItem[] = [
  { label: 'Cidade Alfa', value: 98, displayValue: '98%', meta: 'Regiao Norte' },
  { label: 'Cidade Beta', value: 95, displayValue: '95%', meta: 'Regiao Sul' },
  { label: 'Cidade Gama', value: 91, displayValue: '91%', meta: 'Regiao Leste' },
  { label: 'Cidade Delta', value: 88, displayValue: '88%', meta: 'Regiao Oeste' },
  { label: 'Cidade Epsilon', value: 84, displayValue: '84%', meta: 'Regiao Centro' },
]

const needs: RankingItem[] = [
  { label: 'Cidade Omega', value: 19, displayValue: '19%', meta: 'Regiao Norte' },
  { label: 'Cidade Psi', value: 24, displayValue: '24%', meta: 'Regiao Sul' },
  { label: 'Cidade Chi', value: 28, displayValue: '28%', meta: 'Regiao Leste' },
  { label: 'Cidade Phi', value: 33, displayValue: '33%', meta: 'Regiao Oeste' },
  { label: 'Cidade Tau', value: 37, displayValue: '37%', meta: 'Regiao Centro' },
]

const meta: Meta<typeof RankingPanel> = {
  title: 'Components/RankingPanel',
  component: RankingPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Layout de ranking canonico unico (R2): 5 melhores x 5 que mais precisam, barras + realce do topo.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { title: 'Cobertura por municipio', best, needs, scale: 'percent' },
  decorators: [
    Story => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
}

export const RelativeScale: Story = {
  name: 'Escala relativa ao maior',
  args: {
    title: 'Atendimentos no ciclo',
    scale: 'max',
    best: [
      { label: 'Cidade Alfa', value: 1240, displayValue: '1.240' },
      { label: 'Cidade Beta', value: 980, displayValue: '980' },
      { label: 'Cidade Gama', value: 760, displayValue: '760' },
    ],
    needs: [
      { label: 'Cidade Omega', value: 18, displayValue: '18' },
      { label: 'Cidade Psi', value: 34, displayValue: '34' },
      { label: 'Cidade Chi', value: 52, displayValue: '52' },
    ],
  },
  decorators: [
    Story => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
}
