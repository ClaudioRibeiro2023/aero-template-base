import type { Meta, StoryObj } from '@storybook/react'
import { User } from 'lucide-react'
import { Avatar, AvatarGroup } from './Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['circle', 'square'] },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?u=alice',
    alt: 'Alice',
    size: 'lg',
  },
}

export const WithInitials: Story = {
  args: { name: 'Alice Silva', size: 'lg' },
}

export const WithFallback: Story = {
  args: {
    fallback: <User size={20} />,
    size: 'lg',
  },
}

export const Square: Story = {
  args: { name: 'Bob', shape: 'square', size: 'lg' },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(s => (
        <Avatar key={s} name="Alice Silva" size={s} />
      ))}
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar name="Alice" src="https://i.pravatar.cc/150?u=1" />
      <Avatar name="Bob" src="https://i.pravatar.cc/150?u=2" />
      <Avatar name="Carol" src="https://i.pravatar.cc/150?u=3" />
    </AvatarGroup>
  ),
}

export const GroupWithMax: Story = {
  render: () => (
    <AvatarGroup max={3}>
      <Avatar name="Alice" src="https://i.pravatar.cc/150?u=1" />
      <Avatar name="Bob" src="https://i.pravatar.cc/150?u=2" />
      <Avatar name="Carol" src="https://i.pravatar.cc/150?u=3" />
      <Avatar name="David" src="https://i.pravatar.cc/150?u=4" />
      <Avatar name="Eva" src="https://i.pravatar.cc/150?u=5" />
    </AvatarGroup>
  ),
}
