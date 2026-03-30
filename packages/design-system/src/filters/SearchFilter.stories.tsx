import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { SearchFilter, FilterChip } from './SearchFilter'

const meta: Meta<typeof SearchFilter> = {
  title: 'Filters/SearchFilter',
  component: SearchFilter,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function Demo() {
    const [value, setValue] = useState('')
    return (
      <div style={{ maxWidth: '350px' }}>
        <SearchFilter value={value} onChange={setValue} />
      </div>
    )
  },
}

export const CustomPlaceholder: Story = {
  render: function Demo() {
    const [value, setValue] = useState('')
    return (
      <div style={{ maxWidth: '350px' }}>
        <SearchFilter
          value={value}
          onChange={setValue}
          placeholder="Search users by name or email..."
        />
      </div>
    )
  },
}

export const WithFilterChips: Story = {
  render: function Demo() {
    const [value, setValue] = useState('')
    const [filters, setFilters] = useState(['Active', 'Admin'])
    const removeFilter = (f: string) => setFilters(filters.filter(x => x !== f))
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '450px' }}>
        <SearchFilter value={value} onChange={setValue} placeholder="Search..." />
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {filters.map(f => (
            <FilterChip key={f} label={f} active onRemove={() => removeFilter(f)} />
          ))}
          <FilterChip label="All roles" />
        </div>
      </div>
    )
  },
}

export const FilterChips: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
      <FilterChip label="Status: Active" active onRemove={() => {}} />
      <FilterChip label="Role: Admin" active onRemove={() => {}} />
      <FilterChip label="All departments" />
    </div>
  ),
}
