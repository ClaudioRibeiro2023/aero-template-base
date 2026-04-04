/**
 * Design tokens — mirrors CSS custom properties for use in JS/React.
 * Keep in sync with globals.css :root.
 */
export const tokens = {
  colors: {
    brand: {
      primary: '#00b4d8',
      secondary: '#005f73',
      accent: '#94d2bd',
    },
    accent: {
      purple: '#a78bfa',
      amber: '#fbbf24',
      emerald: '#34d399',
      rose: '#fb7185',
    },
    bg: {
      root: '#09090b',
      surface: '#18181b',
      elevated: '#27272a',
      muted: '#3f3f46',
      subtle: '#52525b',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      muted: '#71717a',
      disabled: '#52525b',
    },
    border: {
      default: '#3f3f46',
      muted: '#27272a',
      strong: '#52525b',
    },
  },
  glass: {
    bg: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.1)',
    blur: '12px',
  },
  glow: {
    brand: 'rgba(0, 180, 216, 0.15)',
    brandStrong: 'rgba(0, 180, 216, 0.25)',
    purple: 'rgba(167, 139, 250, 0.15)',
    error: 'rgba(239, 68, 68, 0.15)',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  },
  layout: {
    sidebarWidth: '260px',
    sidebarCollapsedWidth: '56px',
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  animation: {
    fast: '150ms',
    normal: '280ms',
    slow: '500ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

export type DesignTokens = typeof tokens
