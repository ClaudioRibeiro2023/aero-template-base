import { useState, type ReactNode, type HTMLAttributes } from 'react'
import clsx from 'clsx'
import './Tooltip.css'

/** Placement of the tooltip relative to its trigger element. */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

/** Props for the {@link Tooltip} component. */
export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  /** Text content displayed inside the tooltip bubble. */
  content: string
  /** Placement relative to the wrapped element. @default 'top' */
  position?: TooltipPosition
  /** Delay in milliseconds before the tooltip becomes visible. @default 200 */
  delay?: number
  /** When true, the tooltip is disabled and will not appear. @default false */
  disabled?: boolean
  /** The trigger element that the tooltip wraps. */
  children: ReactNode
}

/**
 * Tooltip that appears on hover/focus with configurable placement and delay.
 * Supports keyboard accessibility (shows on focus, hides on blur).
 *
 * @example
 * ```tsx
 * <Tooltip content="Copiar para a area de transferencia" position="bottom">
 *   <Button variant="ghost" icon={<Copy />} />
 * </Tooltip>
 * ```
 */
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
