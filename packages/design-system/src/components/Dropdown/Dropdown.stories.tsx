import type { Meta, StoryObj } from '@storybook/react'
import { Settings, User, LogOut, Trash2 } from 'lucide-react'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from './Dropdown'
import { Button } from '../Button'

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: 'select',
      options: ['start', 'end', 'center'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>Options</DropdownTrigger>
      <DropdownMenu>
        <DropdownItem>Edit</DropdownItem>
        <DropdownItem>Duplicate</DropdownItem>
        <DropdownSeparator />
        <DropdownItem destructive>Delete</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>My Account</DropdownTrigger>
      <DropdownMenu>
        <DropdownLabel>Account</DropdownLabel>
        <DropdownItem icon={<User size={16} />}>Profile</DropdownItem>
        <DropdownItem icon={<Settings size={16} />}>Settings</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<LogOut size={16} />} destructive>
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}

export const AlignEnd: Story = {
  render: () => (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Dropdown align="end">
        <DropdownTrigger>Align End</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem>Option A</DropdownItem>
          <DropdownItem>Option B</DropdownItem>
          <DropdownItem>Option C</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
}

export const WithSections: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>Actions</DropdownTrigger>
      <DropdownMenu>
        <DropdownLabel>Navigation</DropdownLabel>
        <DropdownItem>Dashboard</DropdownItem>
        <DropdownItem>Reports</DropdownItem>
        <DropdownSeparator />
        <DropdownLabel>Admin</DropdownLabel>
        <DropdownItem icon={<User size={16} />}>Users</DropdownItem>
        <DropdownItem icon={<Settings size={16} />}>Config</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<Trash2 size={16} />} destructive>
          Delete All
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}

export const CustomTrigger: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger showArrow={false}>
        <Button variant="outline" size="sm">
          ⋮
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem>Edit</DropdownItem>
        <DropdownItem>Share</DropdownItem>
        <DropdownItem destructive>Remove</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}
