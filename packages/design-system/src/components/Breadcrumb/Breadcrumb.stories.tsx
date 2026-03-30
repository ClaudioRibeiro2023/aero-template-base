import type { Meta, StoryObj } from '@storybook/react'
import { Home } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb'

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/products">Products</BreadcrumbItem>
      <BreadcrumbItem current>Category</BreadcrumbItem>
    </Breadcrumb>
  ),
}

export const WithCustomSeparator: Story = {
  render: () => (
    <Breadcrumb separator="/">
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
      <BreadcrumbItem current>API Reference</BreadcrumbItem>
    </Breadcrumb>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">
        <Home size={14} />
      </BreadcrumbItem>
      <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
      <BreadcrumbItem current>Profile</BreadcrumbItem>
    </Breadcrumb>
  ),
}

export const TwoItems: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem href="/">Home</BreadcrumbItem>
      <BreadcrumbItem current>Dashboard</BreadcrumbItem>
    </Breadcrumb>
  ),
}
