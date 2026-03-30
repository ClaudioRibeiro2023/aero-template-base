import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from './Progress'

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'success', 'warning', 'error'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: 60, label: 'Upload', showValue: true },
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
      <Progress value={60} variant="primary" label="Primary" showValue />
      <Progress value={80} variant="success" label="Success" showValue />
      <Progress value={40} variant="warning" label="Warning" showValue />
      <Progress value={20} variant="error" label="Error" showValue />
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
      <Progress value={60} size="sm" label="Small" showValue />
      <Progress value={60} size="md" label="Medium" showValue />
      <Progress value={60} size="lg" label="Large" showValue />
    </div>
  ),
}

export const Striped: Story = {
  args: { value: 65, striped: true, label: 'Striped', showValue: true },
}

export const Animated: Story = {
  args: { value: 65, striped: true, animated: true, label: 'Animated', showValue: true },
}

export const FullProgress: Story = {
  args: { value: 100, variant: 'success', label: 'Complete', showValue: true },
}
