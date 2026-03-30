import type { Meta, StoryObj } from '@storybook/react'
import { Home, Settings, Users, BarChart3, FileText, Bell } from 'lucide-react'
import { NavLink, NavGroup } from './NavLink'

const meta: Meta<typeof NavLink> = {
  title: 'Navigation/NavLink',
  component: NavLink,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { href: '/', children: 'Dashboard' },
}

export const WithIcon: Story = {
  args: { href: '/', icon: <Home size={16} />, children: 'Home' },
}

export const Active: Story = {
  args: { href: '/', icon: <Home size={16} />, active: true, children: 'Home' },
}

export const WithBadge: Story = {
  args: { href: '/notifications', icon: <Bell size={16} />, badge: 12, children: 'Notifications' },
}

export const Disabled: Story = {
  args: { href: '/', icon: <Settings size={16} />, disabled: true, children: 'Settings' },
}

export const Sidebar: Story = {
  render: () => (
    <div
      style={{
        width: '240px',
        padding: '0.5rem',
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
      }}
    >
      <NavGroup label="Main">
        <NavLink href="/" icon={<Home size={16} />} active>
          Dashboard
        </NavLink>
        <NavLink href="/analytics" icon={<BarChart3 size={16} />}>
          Analytics
        </NavLink>
        <NavLink href="/users" icon={<Users size={16} />} badge={3}>
          Users
        </NavLink>
      </NavGroup>
      <NavGroup label="Content">
        <NavLink href="/docs" icon={<FileText size={16} />}>
          Documents
        </NavLink>
        <NavLink href="/notifications" icon={<Bell size={16} />} badge={12}>
          Notifications
        </NavLink>
      </NavGroup>
      <NavGroup label="System">
        <NavLink href="/settings" icon={<Settings size={16} />}>
          Settings
        </NavLink>
      </NavGroup>
    </div>
  ),
}
