import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'
import { Button } from '../Button'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <Button>Hover me</Button>,
  },
}

export const Positions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', padding: '3rem', justifyContent: 'center' }}>
      <Tooltip content="Top tooltip" position="top">
        <Button variant="outline">Top</Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" position="bottom">
        <Button variant="outline">Bottom</Button>
      </Tooltip>
      <Tooltip content="Left tooltip" position="left">
        <Button variant="outline">Left</Button>
      </Tooltip>
      <Tooltip content="Right tooltip" position="right">
        <Button variant="outline">Right</Button>
      </Tooltip>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    content: 'You will not see this',
    disabled: true,
    children: <Button variant="ghost">Disabled tooltip</Button>,
  },
}

export const CustomDelay: Story = {
  args: {
    content: 'Delayed tooltip (500ms)',
    delay: 500,
    children: <Button>Wait for it...</Button>,
  },
}
