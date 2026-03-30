import type { Meta, StoryObj } from '@storybook/react'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  useTableSort,
} from './Table'
import { StatusBadge } from '../StatusBadge'

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const sampleData = [
  { id: 1, name: 'Alice Silva', email: 'alice@example.com', role: 'Admin', status: 'active' },
  { id: 2, name: 'Bob Santos', email: 'bob@example.com', role: 'Editor', status: 'active' },
  { id: 3, name: 'Carol Lima', email: 'carol@example.com', role: 'Viewer', status: 'inactive' },
  { id: 4, name: 'David Costa', email: 'david@example.com', role: 'Editor', status: 'active' },
  { id: 5, name: 'Eva Souza', email: 'eva@example.com', role: 'Admin', status: 'pending' },
]

export const Default: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sampleData.map(row => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.role}</TableCell>
            <TableCell>
              <StatusBadge
                variant={
                  row.status === 'active'
                    ? 'success'
                    : row.status === 'pending'
                      ? 'warning'
                      : 'error'
                }
              >
                {row.status}
              </StatusBadge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Striped: Story = {
  render: () => (
    <Table striped>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sampleData.map(row => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Bordered: Story = {
  render: () => (
    <Table bordered>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sampleData.map(row => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const SmallSize: Story = {
  render: () => (
    <Table size="sm">
      <TableHead>
        <TableRow>
          <TableHeaderCell>ID</TableHeaderCell>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sampleData.map(row => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.role}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const WithSorting: Story = {
  render: function SortableTable() {
    const { sortedData, getSortDirection, handleSort } = useTableSort(sampleData, 'name')

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell
              sortable
              sortDirection={getSortDirection('name')}
              onSort={() => handleSort('name')}
            >
              Name
            </TableHeaderCell>
            <TableHeaderCell
              sortable
              sortDirection={getSortDirection('email')}
              onSort={() => handleSort('email')}
            >
              Email
            </TableHeaderCell>
            <TableHeaderCell
              sortable
              sortDirection={getSortDirection('role')}
              onSort={() => handleSort('role')}
            >
              Role
            </TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map(row => (
            <TableRow key={row.id}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
              <TableCell>{row.role}</TableCell>
              <TableCell>
                <StatusBadge
                  variant={
                    row.status === 'active'
                      ? 'success'
                      : row.status === 'pending'
                        ? 'warning'
                        : 'error'
                  }
                >
                  {row.status}
                </StatusBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  },
}

export const WithSelectedRow: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sampleData.map(row => (
          <TableRow key={row.id} selected={row.id === 2}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}
