/**
 * Tailwind Preset gerado a partir dos tokens centralizados.
 *
 * Uso em apps derivadas:
 *   import { templatePreset } from '@template/tokens/tailwind-preset'
 *   export default { presets: [templatePreset], content: [...] }
 */

import { brandTokens, accentTokens, radiusTokens } from './index'

export const templatePreset = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: `var(--brand-primary, ${brandTokens.primary})`,
          secondary: `var(--brand-secondary, ${brandTokens.secondary})`,
          accent: `var(--brand-accent, ${brandTokens.accent})`,
        },
        accent: {
          purple: `var(--accent-purple, ${accentTokens.purple})`,
          amber: `var(--accent-amber, ${accentTokens.amber})`,
          emerald: `var(--accent-emerald, ${accentTokens.emerald})`,
          rose: `var(--accent-rose, ${accentTokens.rose})`,
        },
        surface: {
          root: 'var(--bg-root)',
          base: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          muted: 'var(--bg-muted)',
          subtle: 'var(--bg-subtle)',
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
        sm: `var(--radius-sm, ${radiusTokens.sm})`,
        DEFAULT: `var(--radius-md, ${radiusTokens.md})`,
        md: `var(--radius-md, ${radiusTokens.md})`,
        lg: `var(--radius-lg, ${radiusTokens.lg})`,
        xl: `var(--radius-xl, ${radiusTokens.xl})`,
      },
    },
  },
}
