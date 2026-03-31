import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/design-system/src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
      },
      colors: {
        brand: {
          primary: 'var(--brand-primary, #00b4d8)',
          secondary: 'var(--brand-secondary, #005F73)',
          accent: 'var(--brand-accent, #94D2BD)',
        },
        accent: {
          purple: 'var(--accent-purple, #a78bfa)',
          amber: 'var(--accent-amber, #fbbf24)',
          emerald: 'var(--accent-emerald, #34d399)',
          rose: 'var(--accent-rose, #fb7185)',
        },
        surface: {
          root: 'var(--bg-root)',
          base: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          muted: 'var(--bg-muted)',
          subtle: 'var(--bg-subtle)',
        },
        glass: {
          bg: 'var(--glass-bg)',
          border: 'var(--glass-border)',
          'border-hover': 'var(--glass-border-hover)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
        },
        border: {
          DEFAULT: 'var(--border-default)',
          muted: 'var(--border-muted)',
          strong: 'var(--border-strong)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm, 6px)',
        DEFAULT: 'var(--radius-md, 8px)',
        md: 'var(--radius-md, 8px)',
        lg: 'var(--radius-lg, 12px)',
        xl: 'var(--radius-xl, 16px)',
      },
      backdropBlur: {
        glass: '12px',
        'glass-lg': '20px',
        'glass-xl': '32px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
        'glow-strong': '0 0 30px var(--glow-brand-strong)',
        'glow-purple': '0 0 20px var(--glow-purple)',
        focus: '0 0 0 3px var(--glow-brand)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 12px var(--glow-brand)' },
          '50%': { boxShadow: '0 0 24px var(--glow-brand-strong)' },
        },
        'page-enter': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'page-enter': 'page-enter 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
