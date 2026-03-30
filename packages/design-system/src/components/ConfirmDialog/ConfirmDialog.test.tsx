import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete item?',
  }

  it('renders nothing when closed', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog when open', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Delete item?')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<ConfirmDialog {...defaultProps} description="This cannot be undone." />)
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <ConfirmDialog {...defaultProps}>
        <p>Extra warning</p>
      </ConfirmDialog>
    )
    expect(screen.getByText('Extra warning')).toBeInTheDocument()
  })

  it('renders confirm and cancel buttons', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Confirmar')).toBeInTheDocument()
    expect(screen.getByText('Cancelar')).toBeInTheDocument()
  })

  it('uses custom button texts', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="Yes, delete" cancelText="No, keep" />)
    expect(screen.getByText('Yes, delete')).toBeInTheDocument()
    expect(screen.getByText('No, keep')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm clicked', () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByText('Confirmar'))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onClose when cancel clicked', () => {
    const onClose = vi.fn()
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancelar'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('applies danger variant by default', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} />)
    expect(container.querySelector('.ds-confirm-dialog__icon--danger')).toBeInTheDocument()
  })

  it('applies warning variant', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} variant="warning" />)
    expect(container.querySelector('.ds-confirm-dialog__icon--warning')).toBeInTheDocument()
  })

  it('applies info variant', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} variant="info" />)
    expect(container.querySelector('.ds-confirm-dialog__icon--info')).toBeInTheDocument()
  })

  it('shows loading state on confirm button', () => {
    render(<ConfirmDialog {...defaultProps} isLoading />)
    expect(screen.getByText('Cancelar').closest('button')).toBeDisabled()
  })

  it('renders custom icon', () => {
    render(<ConfirmDialog {...defaultProps} icon={<span data-testid="custom-icon">!</span>} />)
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })
})
