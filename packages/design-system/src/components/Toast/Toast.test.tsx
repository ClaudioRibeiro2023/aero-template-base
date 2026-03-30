import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToastItem, ToastContainer, ToastProvider, useToast } from './Toast'

describe('ToastItem', () => {
  const defaultProps = {
    id: 'toast-1',
    type: 'success' as const,
    message: 'Success message',
    onClose: vi.fn(),
  }

  it('renders message', () => {
    render(<ToastItem {...defaultProps} />)
    expect(screen.getByText('Success message')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(<ToastItem {...defaultProps} title="Title" />)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('has alert role', () => {
    render(<ToastItem {...defaultProps} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies type class', () => {
    render(<ToastItem {...defaultProps} type="error" />)
    expect(screen.getByRole('alert')).toHaveClass('ds-toast--error')
  })

  it('renders close button', () => {
    render(<ToastItem {...defaultProps} />)
    expect(screen.getByLabelText('Fechar notificação')).toBeInTheDocument()
  })

  it('applies warning type class', () => {
    render(<ToastItem {...defaultProps} type="warning" />)
    expect(screen.getByRole('alert')).toHaveClass('ds-toast--warning')
  })

  it('applies info type class', () => {
    render(<ToastItem {...defaultProps} type="info" />)
    expect(screen.getByRole('alert')).toHaveClass('ds-toast--info')
  })
})

describe('ToastContainer', () => {
  it('renders multiple toasts', () => {
    const toasts = [
      { id: '1', type: 'success' as const, message: 'First' },
      { id: '2', type: 'error' as const, message: 'Second' },
    ]
    render(<ToastContainer toasts={toasts} onRemove={vi.fn()} />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('applies position class', () => {
    const { container } = render(
      <ToastContainer toasts={[]} position="bottom-left" onRemove={vi.fn()} />
    )
    expect(container.querySelector('.ds-toast-container--bottom-left')).toBeInTheDocument()
  })

  it('applies top-right position by default', () => {
    const { container } = render(<ToastContainer toasts={[]} onRemove={vi.fn()} />)
    expect(container.querySelector('.ds-toast-container--top-right')).toBeInTheDocument()
  })
})

describe('ToastProvider & useToast', () => {
  function TestConsumer() {
    const toast = useToast()
    return (
      <div>
        <button onClick={() => toast.success('Done!')}>Success</button>
        <button onClick={() => toast.error('Oops!')}>Error</button>
        <button onClick={() => toast.warning('Watch out!')}>Warning</button>
        <button onClick={() => toast.info('FYI')}>Info</button>
      </div>
    )
  }

  it('provides toast context', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    )
    expect(screen.getByRole('button', { name: 'Success' })).toBeInTheDocument()
  })

  it('throws when useToast is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow('useToast must be used within a ToastProvider')
    spy.mockRestore()
  })

  it('adds success toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Success' }))
    expect(screen.getByText('Done!')).toBeInTheDocument()
  })

  it('adds error toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Error' }))
    expect(screen.getByText('Oops!')).toBeInTheDocument()
  })

  it('adds warning toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Warning' }))
    expect(screen.getByText('Watch out!')).toBeInTheDocument()
  })

  it('adds info toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Info' }))
    expect(screen.getByText('FYI')).toBeInTheDocument()
  })

  it('limits toasts to maxToasts', () => {
    render(
      <ToastProvider maxToasts={2}>
        <TestConsumer />
      </ToastProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Success' }))
    fireEvent.click(screen.getByRole('button', { name: 'Error' }))
    fireEvent.click(screen.getByRole('button', { name: 'Warning' }))
    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(2)
  })
})
