import type { Meta, StoryObj } from '@storybook/react'
import { SectionHeader } from './SectionHeader'

const meta: Meta<typeof SectionHeader> = {
  title: 'Layout/SectionHeader',
  component: SectionHeader,
  tags: ['autodocs'],
  argTypes: {
    as: { control: 'inline-radio', options: [1, 2, 3, 4] },
    size: { control: 'inline-radio', options: ['md', 'lg', 'xl'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Cabecalho de secao canonico (R5): sobrescrita + titulo grande (heading real) + subtitulo.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    eyebrow: 'Diagnostico operacional',
    title: 'Saude do programa no recorte',
    subtitle: 'Indicadores do ciclo corrente, atualizados a cada fechamento.',
  },
}

export const WithActions: Story = {
  args: {
    eyebrow: 'Carteira',
    title: 'Municipios atendidos',
    subtitle: 'Distribuicao por regiao e modalidade no periodo selecionado.',
    actions: (
      <button style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
        Exportar
      </button>
    ),
  },
}

export const PageLevel: Story = {
  name: 'Nivel da pagina (as=1)',
  args: {
    as: 1,
    size: 'xl',
    eyebrow: 'Visao geral',
    title: 'Painel do programa',
    subtitle: 'Resumo executivo do ciclo.',
  },
}
