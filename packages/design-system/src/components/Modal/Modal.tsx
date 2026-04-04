/**
 * Modal Component
 *
 * Dialog modal com overlay, suporte a tamanhos e fechar com ESC/click outside.
 */

import { useEffect, useRef, useId, useCallback, type ReactNode, type HTMLAttributes } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'
import './Modal.css'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/** Props for the {@link Modal} component. */
export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the modal is currently visible. */
  isOpen: boolean
  /** Called when the modal requests to close (ESC key, overlay click, or close button). */
  onClose: () => void
  /** Title displayed in the modal header. Accepts ReactNode for rich content. */
  title?: ReactNode
  /** Optional description shown below the title. */
  description?: string
  /** Modal width preset. @default 'md' */
  size?: ModalSize
  /** Whether to show the X close button in the header. @default true */
  showCloseButton?: boolean
  /** Whether clicking the overlay backdrop closes the modal. @default true */
  closeOnOverlayClick?: boolean
  /** Whether pressing the Escape key closes the modal. @default true */
  closeOnEsc?: boolean
  /** Content rendered in the modal footer area (e.g. action buttons). */
  footer?: ReactNode
  /** Modal body content. */
  children?: ReactNode
}

/**
 * Modal dialog with focus trap, ESC close, and overlay click dismiss.
 * Locks body scroll while open and manages focus cycling with Tab/Shift+Tab.
 *
 * @example
 * ```tsx
 * <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirmar exclusao">
 *   <p>Tem certeza que deseja excluir?</p>
 *   <Modal footer={<Button onClick={handleDelete}>Excluir</Button>} />
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  footer,
  className,
  children,
  ...props
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const reactId = useId()
  const titleId = `modal-title-${reactId}`
  const descId = `modal-desc-${reactId}`

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEsc, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Focus management: focus modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  // Real focus trap: keep Tab cycling inside the modal
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return

    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="ds-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
    >
      <div
        ref={modalRef}
        className={clsx('ds-modal', `ds-modal--${size}`, className)}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="ds-modal__header">
            <div className="ds-modal__header-content">
              {title && (
                <h2 id={titleId} className="ds-modal__title">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="ds-modal__description">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ds-modal__close"
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="ds-modal__body">{children}</div>

        {/* Footer */}
        {footer && <div className="ds-modal__footer">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
