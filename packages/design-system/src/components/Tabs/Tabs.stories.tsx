import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Home, Settings, User } from 'lucide-react'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from './Tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['line', 'pills', 'enclosed'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview">
      <TabList>
        <Tab value="overview">Overview</Tab>
        <Tab value="analytics">Analytics</Tab>
        <Tab value="settings">Settings</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="overview">
          <p style={{ padding: '1rem 0' }}>Overview content goes here.</p>
        </TabPanel>
        <TabPanel value="analytics">
          <p style={{ padding: '1rem 0' }}>Analytics charts and data.</p>
        </TabPanel>
        <TabPanel value="settings">
          <p style={{ padding: '1rem 0' }}>Application settings.</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
}

export const Pills: Story = {
  render: () => (
    <Tabs defaultValue="tab1" variant="pills">
      <TabList>
        <Tab value="tab1">All</Tab>
        <Tab value="tab2">Active</Tab>
        <Tab value="tab3">Archived</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="tab1">
          <p style={{ padding: '1rem 0' }}>All items.</p>
        </TabPanel>
        <TabPanel value="tab2">
          <p style={{ padding: '1rem 0' }}>Active items only.</p>
        </TabPanel>
        <TabPanel value="tab3">
          <p style={{ padding: '1rem 0' }}>Archived items.</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
}

export const Enclosed: Story = {
  render: () => (
    <Tabs defaultValue="tab1" variant="enclosed">
      <TabList>
        <Tab value="tab1">General</Tab>
        <Tab value="tab2">Security</Tab>
        <Tab value="tab3">Notifications</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="tab1">
          <p style={{ padding: '1rem 0' }}>General settings.</p>
        </TabPanel>
        <TabPanel value="tab2">
          <p style={{ padding: '1rem 0' }}>Security configuration.</p>
        </TabPanel>
        <TabPanel value="tab3">
          <p style={{ padding: '1rem 0' }}>Notification preferences.</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="home">
      <TabList>
        <Tab value="home" icon={<Home size={16} />}>
          Home
        </Tab>
        <Tab value="profile" icon={<User size={16} />}>
          Profile
        </Tab>
        <Tab value="settings" icon={<Settings size={16} />}>
          Settings
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="home">
          <p style={{ padding: '1rem 0' }}>Home dashboard.</p>
        </TabPanel>
        <TabPanel value="profile">
          <p style={{ padding: '1rem 0' }}>User profile.</p>
        </TabPanel>
        <TabPanel value="settings">
          <p style={{ padding: '1rem 0' }}>App settings.</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
}

export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabList>
        <Tab value="tab1">Available</Tab>
        <Tab value="tab2" disabled>
          Premium (Locked)
        </Tab>
        <Tab value="tab3">Help</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="tab1">
          <p style={{ padding: '1rem 0' }}>Free content.</p>
        </TabPanel>
        <TabPanel value="tab2">
          <p style={{ padding: '1rem 0' }}>Premium content.</p>
        </TabPanel>
        <TabPanel value="tab3">
          <p style={{ padding: '1rem 0' }}>Help &amp; support.</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
}

export const Controlled: Story = {
  render: function ControlledTabs() {
    const [tab, setTab] = useState('tab1')
    return (
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
          Active tab: <strong>{tab}</strong>
        </p>
        <Tabs value={tab} onChange={setTab}>
          <TabList>
            <Tab value="tab1">First</Tab>
            <Tab value="tab2">Second</Tab>
            <Tab value="tab3">Third</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="tab1">
              <p style={{ padding: '1rem 0' }}>First panel.</p>
            </TabPanel>
            <TabPanel value="tab2">
              <p style={{ padding: '1rem 0' }}>Second panel.</p>
            </TabPanel>
            <TabPanel value="tab3">
              <p style={{ padding: '1rem 0' }}>Third panel.</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    )
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <div key={size}>
          <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Size: {size}</p>
          <Tabs defaultValue="a" size={size}>
            <TabList>
              <Tab value="a">Tab A</Tab>
              <Tab value="b">Tab B</Tab>
            </TabList>
            <TabPanels>
              <TabPanel value="a">
                <p style={{ padding: '0.5rem 0' }}>Content A ({size})</p>
              </TabPanel>
              <TabPanel value="b">
                <p style={{ padding: '0.5rem 0' }}>Content B ({size})</p>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      ))}
    </div>
  ),
}
