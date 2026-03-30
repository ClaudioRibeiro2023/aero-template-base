import type { Meta, StoryObj } from '@storybook/react'
import { Select } from './Select'

const countries = [
  { value: 'br', label: 'Brazil' },
  { value: 'us', label: 'United States' },
  { value: 'jp', label: 'Japan' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
]

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { id: 'sel1', label: 'Country', options: countries, placeholder: 'Select a country' },
}

export const WithHelperText: Story = {
  args: {
    id: 'sel2',
    label: 'Region',
    options: countries,
    helperText: 'Choose your primary region',
  },
}

export const WithError: Story = {
  args: { id: 'sel3', label: 'Country', options: countries, error: 'Please select a country' },
}

export const Disabled: Story = {
  args: { id: 'sel4', label: 'Country', options: countries, disabled: true, value: 'br' },
}

export const WithDisabledOption: Story = {
  args: {
    id: 'sel5',
    label: 'Country',
    options: [...countries, { value: 'xx', label: 'Not available', disabled: true }],
    placeholder: 'Choose...',
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '300px' }}>
      <Select id="ssm" size="sm" label="Small" options={countries} />
      <Select id="smd" size="md" label="Medium" options={countries} />
      <Select id="slg" size="lg" label="Large" options={countries} />
    </div>
  ),
}
