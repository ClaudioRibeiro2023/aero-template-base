import { type ReactNode } from 'react'
import { AlertTriangle, Info, Trash2 } from 'lucide-react'
import { Modal } from '../Modal'
import { Button } from '../Button'
import clsx from 'clsx'
import './ConfirmDialog.css'

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info'

export interface ConfirmDialogProps {
  /** Visibilidade */
  isOpen: boolean
  /** Callback ao fechar */
  onClose: () => void
  /** Callback ao confirmar */
  onConfirm: () => void
  /** Título */
  title: string
  /** Mensagem/descrição */
  description?: string
  /** Texto do botão confirmar */
  confirmText?: string
  /** Texto do botão cancelar */
  cancelText?: string
  /** Variante visual */
  variant?: ConfirmDialogVariant
  /** Loading no botão confirmar */
  isLoading?: boolean
  /** Ícone customizado */
  icon?: ReactNode
  children?: ReactNode
}

const variantIcons: Record<ConfirmDialogVariant, ReactNode> = {
  danger: <Trash2 size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  icon,
  children,
}: ConfirmDialogProps) {
  const displayIcon = icon ?? variantIcons[variant]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
      footer={
        <div className="ds-confirm-dialog__actions">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      {displayIcon && (
        <div className={clsx('ds-confirm-dialog__icon', `ds-confirm-dialog__icon--${variant}`)}>
          {displayIcon}
        </div>
      )}
      {children}
    </Modal>
  )
}

export default ConfirmDialog
