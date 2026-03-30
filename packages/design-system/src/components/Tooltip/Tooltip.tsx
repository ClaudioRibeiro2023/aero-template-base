import { useState, type ReactNode, type HTMLAttributes } from 'react'
import clsx from 'clsx'
import './Tooltip.css'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  /** Texto do tooltip */
  content: string
  /** Posição do tooltip */
  position?: TooltipPosition
  /** Delay em ms antes de mostrar */
  delay?: number
  /** Desabilitar tooltip */
  disabled?: boolean
  children: ReactNode
}

export function Tooltip({
  content,
  position = 'top',
  delay = 200,
  disabled = false,
  className,
  children,
  ...props
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    if (disabled) return
    if (delay <= 0) {
      setVisible(true)
      return
    }
    const id = setTimeout(() => setVisible(true), delay)
    setTimeoutId(id)
  }

  const hide = () => {
    if (timeoutId) clearTimeout(timeoutId)
    setVisible(false)
  }

  return (
    <div
      className={clsx('ds-tooltip-wrapper', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...props}
    >
      {children}
      <div
        role="tooltip"
        className={clsx('ds-tooltip', `ds-tooltip--${position}`, visible && 'ds-tooltip--visible')}
      >
        {content}
      </div>
    </div>
  )
}

export default Tooltip
