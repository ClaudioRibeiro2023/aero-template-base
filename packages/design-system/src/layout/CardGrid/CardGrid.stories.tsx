import type { Meta, StoryObj } from '@storybook/react'
import { CardGrid } from './CardGrid'
import { StatCard } from '../../components/StatCard/StatCard'

const meta: Meta<typeof CardGrid> = {
  title: 'Layout/CardGrid',
  component: CardGrid,
  tags: ['autodocs'],
  argTypes: {
    gap: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  parameters: {
    docs: {
      description: {
        component: 'Grade de cards com altura igual (R4) e gaps por tokens. Sem vazio morto.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const EqualHeight: Story = {
  name: 'Alturas iguais (conteudo desigual)',
  render: args => (
    <CardGrid {...args} minItemWidth="220px">
      <StatCard
        title="Receita"
        value="R$ 2,4M"
        delta={{ value: '+8%', direction: 'up' }}
        info="Periodo."
      />
      <StatCard
        title="Municipios"
        value="628"
        delta={{ value: '+18', direction: 'up', label: 'vs ciclo anterior' }}
        sparkline={[10, 14, 13, 20, 26, 31]}
        info="Atendidos no ciclo."
      />
      <StatCard title="Pendencias" value="12" tone="warning" info="Em aberto." />
    </CardGrid>
  ),
}

export const FixedColumns: Story = {
  args: { columns: 2, gap: 'lg' },
  render: args => (
    <CardGrid {...args}>
      <StatCard title="A" value="1" info="x" />
      <StatCard title="B" value="2" info="y" />
    </CardGrid>
  ),
}
