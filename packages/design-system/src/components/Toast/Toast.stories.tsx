import type { Meta, StoryObj } from '@storybook/react'
import { ToastItem, ToastProvider, useToast } from './Toast'
import { Button } from '../Button'

const meta: Meta<typeof ToastItem> = {
  title: 'Components/Toast',
  component: ToastItem,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    id: '1',
    type: 'success',
    title: 'Success',
    message: 'Your changes have been saved successfully.',
    onClose: () => {},
    duration: 0,
  },
}

export const Error: Story = {
  args: {
    id: '2',
    type: 'error',
    title: 'Error',
    message: 'Something went wrong. Please try again.',
    onClose: () => {},
    duration: 0,
  },
}

export const Warning: Story = {
  args: {
    id: '3',
    type: 'warning',
    title: 'Warning',
    message: 'Your session is about to expire.',
    onClose: () => {},
    duration: 0,
  },
}

export const Info: Story = {
  args: {
    id: '4',
    type: 'info',
    title: 'Info',
    message: 'A new version is available for download.',
    onClose: () => {},
    duration: 0,
  },
}

export const WithoutTitle: Story = {
  args: {
    id: '5',
    type: 'info',
    message: 'Simple notification without a title.',
    onClose: () => {},
    duration: 0,
  },
}

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
      <ToastItem
        id="1"
        type="success"
        title="Success"
        message="Operation completed."
        onClose={() => {}}
        duration={0}
      />
      <ToastItem
        id="2"
        type="error"
        title="Error"
        message="Something went wrong."
        onClose={() => {}}
        duration={0}
      />
      <ToastItem
        id="3"
        type="warning"
        title="Warning"
        message="Proceed with caution."
        onClose={() => {}}
        duration={0}
      />
      <ToastItem
        id="4"
        type="info"
        title="Info"
        message="New updates available."
        onClose={() => {}}
        duration={0}
      />
    </div>
  ),
}

function ToastPlayground() {
  const toast = useToast()
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Button variant="primary" size="sm" onClick={() => toast.success('Saved!', 'Success')}>
        Success Toast
      </Button>
      <Button variant="danger" size="sm" onClick={() => toast.error('Failed to save.', 'Error')}>
        Error Toast
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.warning('Session expiring.', 'Warning')}
      >
        Warning Toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast.info('Version 2.0 released.', 'Info')}
      >
        Info Toast
      </Button>
    </div>
  )
}

export const Interactive: Story = {
  render: () => (
    <ToastProvider position="top-right" maxToasts={5}>
      <ToastPlayground />
    </ToastProvider>
  ),
}
