import type { Meta, StoryObj } from '@storybook/react'
import { InfoTooltip, InfoPopover } from './InfoTooltip'

const meta: Meta<typeof InfoTooltip> = {
  title: 'Components/InfoTooltip',
  component: InfoTooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Divulgacao de informacao canonica (R3): portal + collisionPadding. Nunca posicione o "i" na mao.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Tooltip: Story = {
  args: {
    content: 'Soma do periodo selecionado.',
  },
  decorators: [
    Story => (
      <div style={{ padding: '4rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span>Receita liquida</span>
        <Story />
      </div>
    ),
  ],
}

export const TooltipSides: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '3rem', padding: '4rem', justifyContent: 'center' }}>
      <InfoTooltip side="top" content="Abre acima" />
      <InfoTooltip side="right" content="Abre a direita" />
      <InfoTooltip side="bottom" content="Abre abaixo" />
      <InfoTooltip side="left" content="Abre a esquerda" />
    </div>
  ),
}

export const Popover: StoryObj<typeof InfoPopover> = {
  render: () => (
    <div style={{ padding: '4rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span>Indice de cobertura</span>
      <InfoPopover
        title="Como calculamos"
        showClose
        content={
          <p style={{ margin: 0 }}>
            Razao entre a area efetivamente atendida e a area de referencia do recorte, no ciclo
            corrente. Atualizada a cada novo fechamento.
          </p>
        }
      />
    </div>
  ),
}

export const NearViewportEdge: Story = {
  name: 'Colisao com a borda (nao estoura)',
  render: () => (
    <div style={{ position: 'relative', height: 160 }}>
      <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4 }}>
        <span>Borda direita</span>
        <InfoTooltip
          side="right"
          content="Mesmo pedindo 'right', reposiciona para nao estourar a viewport."
        />
      </div>
    </div>
  ),
}
