import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Toggle } from './Toggle'

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function Demo() {
    const [checked, setChecked] = useState(false)
    return <Toggle checked={checked} onChange={setChecked} label="Dark mode" />
  },
}

export const Checked: Story = {
  render: function Demo() {
    const [checked, setChecked] = useState(true)
    return <Toggle checked={checked} onChange={setChecked} label="Notifications" />
  },
}

export const Disabled: Story = {
  args: { checked: false, onChange: () => {}, label: 'Disabled', disabled: true },
}

export const AllSizes: Story = {
  render: function Demo() {
    const [sm, setSm] = useState(false)
    const [md, setMd] = useState(true)
    const [lg, setLg] = useState(false)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Toggle checked={sm} onChange={setSm} size="sm" label="Small" />
        <Toggle checked={md} onChange={setMd} size="md" label="Medium" />
        <Toggle checked={lg} onChange={setLg} size="lg" label="Large" />
      </div>
    )
  },
}

export const WithoutLabel: Story = {
  render: function Demo() {
    const [checked, setChecked] = useState(false)
    return <Toggle checked={checked} onChange={setChecked} />
  },
}
