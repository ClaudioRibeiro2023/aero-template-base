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
        'focus:bg-white',
        'focus:text-gray-900',
        'focus:rounded',
        'focus:shadow-lg',
        'focus:outline',
        'focus:outline-2',
        'focus:outline-blue-600',
        'focus:text-sm',
        'focus:font-medium',
      ].join(' ')}
    >
      {label}
    </a>
  )
}

export default SkipLink
