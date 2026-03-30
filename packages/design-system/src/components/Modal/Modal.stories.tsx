import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Modal } from './Modal'
import { Button } from '../Button'
import { Input } from '../Input'

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Default Modal">
          <p>This is the modal content. Press ESC or click outside to close.</p>
        </Modal>
      </>
    )
  },
}

export const WithDescription: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Confirm Action"
          description="This action cannot be undone."
        >
          <p>Are you sure you want to proceed?</p>
        </Modal>
      </>
    )
  },
}

export const WithFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Edit Profile"
          footer={
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Name" placeholder="Enter your name" />
            <Input label="Email" placeholder="Enter your email" type="email" />
          </div>
        </Modal>
      </>
    )
  },
}

export const Small: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Small Modal</Button>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Small" size="sm">
          <p>A compact modal for quick confirmations.</p>
        </Modal>
      </>
    )
  },
}

export const Large: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>Large Modal</Button>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Large Modal" size="lg">
          <p>A spacious modal for complex content with multiple sections.</p>
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'var(--color-surface-muted, #f1f5f9)',
              borderRadius: '0.5rem',
            }}
          >
            <p>Additional content area for forms, tables, or detailed information.</p>
          </div>
        </Modal>
      </>
    )
  },
}

export const NoCloseButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>No Close Button</Button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Required Action"
          showCloseButton={false}
          closeOnOverlayClick={false}
          closeOnEsc={false}
          footer={
            <Button onClick={() => setOpen(false)} fullWidth>
              I Understand
            </Button>
          }
        >
          <p>This modal requires the user to take an explicit action to close it.</p>
        </Modal>
      </>
    )
  },
}

export const AllSizes: Story = {
  render: () => {
    const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null)
    return (
      <>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {(['sm', 'md', 'lg', 'xl', 'full'] as const).map(s => (
            <Button key={s} variant="outline" size="sm" onClick={() => setSize(s)}>
              {s.toUpperCase()}
            </Button>
          ))}
        </div>
        {size && (
          <Modal isOpen onClose={() => setSize(null)} title={`Size: ${size}`} size={size}>
            <p>
              Modal with size <strong>{size}</strong>.
            </p>
          </Modal>
        )}
      </>
    )
  },
}
