import { type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import './Avatar.css'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarShape = 'circle' | 'square'

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  /** URL da imagem */
  src?: string
  /** Texto alternativo */
  alt?: string
  /** Nome para gerar iniciais como fallback */
  name?: string
  /** Tamanho */
  size?: AvatarSize
  /** Formato */
  shape?: AvatarShape
  /** Ícone fallback */
  fallback?: ReactNode
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`
  return parts[0]?.substring(0, 2) || '?'
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  fallback,
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      className={clsx(
        'ds-avatar',
        `ds-avatar--${size}`,
        shape === 'square' && 'ds-avatar--square',
        className
      )}
      role="img"
      aria-label={alt || name || 'Avatar'}
      {...props}
    >
      {src ? (
        <img className="ds-avatar__image" src={src} alt={alt || name || 'Avatar'} />
      ) : name ? (
        <span className="ds-avatar__initials">{getInitials(name)}</span>
      ) : (
        fallback || <span className="ds-avatar__initials">?</span>
      )}
    </div>
  )
}

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Máximo de avatars visíveis */
  max?: number
  children: ReactNode
}

export function AvatarGroup({ max, className, children, ...props }: AvatarGroupProps) {
  const items = Array.isArray(children) ? children : [children]
  const visible = max ? items.slice(0, max) : items
  const remaining = max ? items.length - max : 0

  return (
    <div className={clsx('ds-avatar-group', className)} {...props}>
      {remaining > 0 && (
        <div className="ds-avatar ds-avatar--md" aria-label={`+${remaining} more`}>
          <span className="ds-avatar__initials">+{remaining}</span>
        </div>
      )}
      {[...visible].reverse()}
    </div>
  )
}

export default Avatar
