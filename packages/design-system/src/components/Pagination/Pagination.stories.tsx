import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Pagination } from './Pagination'

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function Demo() {
    const [page, setPage] = useState(1)
    return <Pagination page={page} totalPages={10} onChange={setPage} />
  },
}

export const ManyPages: Story = {
  render: function Demo() {
    const [page, setPage] = useState(10)
    return <Pagination page={page} totalPages={50} onChange={setPage} />
  },
}

export const FewPages: Story = {
  render: function Demo() {
    const [page, setPage] = useState(1)
    return <Pagination page={page} totalPages={3} onChange={setPage} />
  },
}

export const WithoutPrevNext: Story = {
  render: function Demo() {
    const [page, setPage] = useState(1)
    return <Pagination page={page} totalPages={10} onChange={setPage} showPrevNext={false} />
  },
}

export const AllSizes: Story = {
  render: function Demo() {
    const [page, setPage] = useState(3)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {(['sm', 'md', 'lg'] as const).map(size => (
          <div key={size}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
              Size: {size}
            </p>
            <Pagination page={page} totalPages={10} onChange={setPage} size={size} />
          </div>
        ))}
      </div>
    )
  },
}
