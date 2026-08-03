import type { Meta, StoryObj } from '@storybook/react'
import { PageDataFreshness } from './PageDataFreshness'

const meta: Meta<typeof PageDataFreshness> = {
  title: 'Layout/PageDataFreshness',
  component: PageDataFreshness,
  tags: ['autodocs'],
  argTypes: {
    audience: { control: 'inline-radio', options: ['external', 'internal', 'mixed'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Carimbo de atualizacao unico por pagina (R6), audience-aware (R1): em pagina externa a fonte tecnica nao aparece como texto.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const External: Story = {
  name: 'Cliente externo (fonte oculta)',
  args: {
    updatedAt: new Date(2026, 5, 20),
    audience: 'external',
    source: 'painel_interno',
  },
}

export const Internal: Story = {
  name: 'Ferramenta interna (fonte visivel)',
  args: {
    updatedAt: new Date(2026, 5, 20),
    audience: 'internal',
    source: 'painel_interno',
  },
}

export const PreformattedString: Story = {
  args: {
    updatedAt: '20/06/2026 as 14h',
    audience: 'external',
  },
}
