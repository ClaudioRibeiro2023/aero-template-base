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
          primary: 'var(--brand-primary, #0087A8)',
          secondary: 'var(--brand-secondary, #005F73)',
          accent: 'var(--brand-accent, #94D2BD)',
        },
      },
    },
  },
  plugins: [],
}

export default config
