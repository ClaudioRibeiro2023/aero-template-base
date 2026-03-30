import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }

  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        Content
      </Modal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog when open', () => {
    render(<Modal {...defaultProps}>Content</Modal>)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<Modal {...defaultProps}>Modal body</Modal>)
    expect(screen.getByText('Modal body')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(
      <Modal {...defaultProps} title="My Title">
        Body
      </Modal>
    )
    expect(screen.getByText('My Title')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(
      <Modal {...defaultProps} title="T" description="Desc text">
        Body
      </Modal>
    )
    expect(screen.getByText('Desc text')).toBeInTheDocument()
  })

  it('renders footer', () => {
    render(
      <Modal {...defaultProps} footer={<button>Save</button>}>
        Body
      </Modal>
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('has aria-modal attribute', () => {
    render(<Modal {...defaultProps}>Body</Modal>)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('has aria-labelledby when title is present', () => {
    render(
      <Modal {...defaultProps} title="Title">
        Body
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    const labelledBy = dialog.getAttribute('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(labelledBy).toMatch(/^modal-title-/)
    // Title element has matching id
    expect(screen.getByText('Title').id).toBe(labelledBy)
  })

  it('has aria-describedby when description is present', () => {
    render(
      <Modal {...defaultProps} title="T" description="Desc">
        Body
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    const describedBy = dialog.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(describedBy).toMatch(/^modal-desc-/)
    expect(screen.getByText('Desc').id).toBe(describedBy)
  })

  it('does not have aria-describedby without description', () => {
    render(
      <Modal {...defaultProps} title="T">
        Body
      </Modal>
    )
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby')
  })

  it('uses unique IDs for multiple modals', () => {
    render(
      <>
        <Modal isOpen onClose={vi.fn()} title="Modal A">
          A
        </Modal>
        <Modal isOpen onClose={vi.fn()} title="Modal B">
          B
        </Modal>
      </>
    )
    const dialogs = screen.getAllByRole('dialog')
    const idA = dialogs[0].getAttribute('aria-labelledby')
    const idB = dialogs[1].getAttribute('aria-labelledby')
    expect(idA).not.toBe(idB)
  })

  it('shows close button by default', () => {
    render(
      <Modal {...defaultProps} title="T">
        Body
      </Modal>
    )
    expect(screen.getByLabelText('Fechar modal')).toBeInTheDocument()
  })

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal {...defaultProps} showCloseButton={false}>
        Body
      </Modal>
    )
    expect(screen.queryByLabelText('Fechar modal')).not.toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} title="T">
        Body
      </Modal>
    )
    fireEvent.click(screen.getByLabelText('Fechar modal'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        Body
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose on Escape when closeOnEsc is false', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} closeOnEsc={false}>
        Body
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose on overlay click', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        Body
      </Modal>
    )
    const overlay = screen.getByRole('dialog')
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose on overlay click when closeOnOverlayClick is false', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose} closeOnOverlayClick={false}>
        Body
      </Modal>
    )
    const overlay = screen.getByRole('dialog')
    fireEvent.click(overlay)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not call onClose when clicking inside modal content', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen onClose={onClose}>
        Body text
      </Modal>
    )
    fireEvent.click(screen.getByText('Body text'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('applies size class', () => {
    const { container } = render(
      <Modal {...defaultProps} size="lg">
        Body
      </Modal>
    )
    expect(container.querySelector('.ds-modal--lg')).toBeInTheDocument()
  })

  it('applies md size by default', () => {
    const { container } = render(<Modal {...defaultProps}>Body</Modal>)
    expect(container.querySelector('.ds-modal--md')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Modal {...defaultProps} className="my-modal">
        Body
      </Modal>
    )
    expect(container.querySelector('.my-modal')).toBeInTheDocument()
  })

  it('locks body scroll when open', () => {
    const { unmount } = render(<Modal {...defaultProps}>Body</Modal>)
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
