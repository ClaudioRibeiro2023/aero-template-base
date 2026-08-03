import type { Meta, StoryObj } from '@storybook/react'
import { CalendarDays, MapPin } from 'lucide-react'
import { TopbarStatusBand } from './TopbarStatusBand'

const meta: Meta<typeof TopbarStatusBand> = {
  title: 'Layout/TopbarStatusBand',
  component: TopbarStatusBand,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Banda de status compacta do topo (R6): ciclo + contagem + LIVE numa unica peca, nao espalhada pelo topbar.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    live: true,
    items: [
      { label: 'Ciclo', value: '2026 - Junho' },
      { label: 'Municipios', value: '628' },
    ],
  },
}

export const WithIcons: Story = {
  args: {
    live: true,
    items: [
      { icon: <CalendarDays size={13} />, label: 'Ciclo', value: '2026 - Junho' },
      { icon: <MapPin size={13} />, label: 'Municipios', value: '628' },
    ],
  },
}

export const NoLive: Story = {
  args: {
    live: false,
    items: [
      { label: 'Ciclo', value: '2026 - Junho' },
      { label: 'Municipios', value: '628' },
    ],
  },
}
