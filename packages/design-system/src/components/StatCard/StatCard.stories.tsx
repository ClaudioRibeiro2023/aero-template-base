import type { Meta, StoryObj } from '@storybook/react'
import { Users } from 'lucide-react'
import { StatCard } from './StatCard'

const meta: Meta<typeof StatCard> = {
  title: 'Components/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'select', options: ['default', 'positive', 'negative', 'warning'] },
    infoMode: { control: 'inline-radio', options: ['tooltip', 'popover'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Card de KPI canonico (R2): titulo - valor - delta - sparkline + "i" no canto inferior direito. Sem linha de fonte por card.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Municipios atendidos',
    value: '628',
    delta: { value: '+18', direction: 'up', label: 'vs ciclo anterior' },
    sparkline: [12, 18, 15, 22, 28, 31],
    info: 'Municipios com pelo menos um atendimento registrado no ciclo.',
  },
  decorators: [
    Story => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
}

export const NegativeDelta: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <StatCard
        title="Tempo medio de resposta"
        value="3,2 dias"
        tone="negative"
        delta={{ value: '+0,4 dia', direction: 'down', label: 'vs meta' }}
        sparkline={[2.1, 2.4, 2.6, 2.9, 3.0, 3.2]}
        info="Media entre solicitacao e primeiro atendimento."
      />
    </div>
  ),
}

export const WithIconAndPopover: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <StatCard
        title="Cobertura"
        value="62,3%"
        icon={<Users size={16} />}
        tone="positive"
        delta={{ value: '+4,1 p.p.', direction: 'up' }}
        infoMode="popover"
        infoTitle="Como calculamos"
        info="Razao entre a area atendida e a area de referencia do recorte."
      />
    </div>
  ),
}

export const Grid: Story = {
  name: 'Grade (alturas iguais)',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        alignItems: 'stretch',
        width: 760,
      }}
    >
      <StatCard
        title="Receita"
        value="R$ 2,4M"
        delta={{ value: '+8%', direction: 'up' }}
        info="Periodo."
      />
      <StatCard
        title="Municipios"
        value="628"
        delta={{ value: '+18', direction: 'up' }}
        sparkline={[10, 14, 13, 20, 26, 31]}
        info="Atendidos no ciclo."
      />
      <StatCard
        title="Pendencias"
        value="12"
        tone="warning"
        delta={{ value: '0', direction: 'neutral' }}
        info="Em aberto."
      />
    </div>
  ),
}
