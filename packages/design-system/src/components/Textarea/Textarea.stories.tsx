import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './Textarea'

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { id: 'ta1', label: 'Description', placeholder: 'Enter a description...' },
}

export const WithHelperText: Story = {
  args: {
    id: 'ta2',
    label: 'Bio',
    helperText: 'Brief description about yourself',
    placeholder: 'Tell us about you...',
  },
}

export const WithError: Story = {
  args: {
    id: 'ta3',
    label: 'Comment',
    error: 'This field is required',
    placeholder: 'Write a comment...',
  },
}

export const WithCounter: Story = {
  render: function Demo() {
    const [val, setVal] = useState('')
    return (
      <Textarea
        id="ta4"
        label="Message"
        showCount
        maxLength={200}
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Type your message..."
      />
    )
  },
}

export const NoResize: Story = {
  args: { id: 'ta5', label: 'Fixed size', noResize: true, placeholder: 'Cannot resize this...' },
}

export const Disabled: Story = {
  args: { id: 'ta6', label: 'Disabled', disabled: true, value: 'This field is disabled' },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
      <Textarea id="sm" size="sm" label="Small" placeholder="Small textarea" />
      <Textarea id="md" size="md" label="Medium" placeholder="Medium textarea" />
      <Textarea id="lg" size="lg" label="Large" placeholder="Large textarea" />
    </div>
  ),
}
