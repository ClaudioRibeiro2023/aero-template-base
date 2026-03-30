import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ConfirmDialog } from './ConfirmDialog'
import { Button } from '../Button'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['danger', 'warning', 'info'] },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Danger: Story = {
  render: function Demo() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete Item
        </Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            setOpen(false)
            alert('Deleted!')
          }}
          title="Delete this item?"
          description="This action cannot be undone. All associated data will be permanently removed."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </>
    )
  },
}

export const Warning: Story = {
  render: function Demo() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Reset Settings
        </Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          title="Reset all settings?"
          description="Your preferences will revert to their default values."
          confirmText="Reset"
          variant="warning"
        />
      </>
    )
  },
}

export const Info: Story = {
  render: function Demo() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Publish</Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          title="Publish this article?"
          description="It will become visible to all users."
          confirmText="Publish"
          variant="info"
        />
      </>
    )
  },
}

export const WithLoading: Story = {
  render: function Demo() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const handleConfirm = () => {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setOpen(false)
      }, 2000)
    }
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete
        </Button>
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
          title="Delete permanently?"
          description="Processing..."
          isLoading={loading}
          variant="danger"
        />
      </>
    )
  },
}
