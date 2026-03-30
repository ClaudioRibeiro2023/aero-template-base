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
      },
      colors: {
        brand: {
          primary: 'var(--brand-primary, #14b8a6)',
          secondary: 'var(--brand-secondary, #0e7490)',
          accent: 'var(--brand-accent, #2dd4bf)',
        },
      },
    },
  },
  plugins: [],
}

export default config
