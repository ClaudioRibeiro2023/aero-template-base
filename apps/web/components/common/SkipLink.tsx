'use client'

/**
 * SkipLink — Accessibility skip navigation component.
 *
 * Sprint 20: Acessibilidade - WCAG 2.1 AA
 * Renders a visually-hidden link that becomes visible on focus,
 * allowing keyboard users to skip to main content.
 *
 * Usage:
 *   <SkipLink targetId="main-content" />
 *   <main id="main-content">...</main>
 */
interface SkipLinkProps {
  targetId?: string
  label?: string
}

export function SkipLink({
  targetId = 'main-content',
  label = 'Pular para o conteúdo principal',
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={[
        'sr-only',
        'focus:not-sr-only',
        'focus:fixed',
        'focus:top-2',
        'focus:left-2',
        'focus:z-[9999]',
        'focus:px-4',
        'focus:py-2',
        'focus:bg-[var(--bg-surface)]',
        'focus:text-[var(--text-primary)]',
        'focus:rounded-[var(--radius-md)]',
        'focus:shadow-[var(--shadow-lg)]',
        'focus:outline',
        'focus:outline-2',
        'focus:outline-[var(--brand-primary)]',
        'focus:text-sm',
        'focus:font-medium',
        'focus:border',
        'focus:border-white/[0.06]',
      ].join(' ')}
    >
      {label}
    </a>
  )
}

export default SkipLink
