/**
 * Tailwind Preset gerado a partir dos tokens centralizados.
 *
 * Uso em apps derivadas:
 *   import { templatePreset } from '@template/tokens/tailwind-preset'
 *   export default { presets: [templatePreset], content: [...] }
 */

import { brandTokens, accentTokens, radiusTokens, glassTokens, glowTokens } from './index'

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
        glass: {
          bg: `var(--glass-bg, ${glassTokens.dark.glassBg})`,
          border: `var(--glass-border, ${glassTokens.dark.glassBorder})`,
          'border-hover': `var(--glass-border-hover, ${glassTokens.dark.glassBorderHover})`,
        },
      },
      borderRadius: {
        sm: `var(--radius-sm, ${radiusTokens.sm})`,
        DEFAULT: `var(--radius-md, ${radiusTokens.md})`,
        md: `var(--radius-md, ${radiusTokens.md})`,
        lg: `var(--radius-lg, ${radiusTokens.lg})`,
        xl: `var(--radius-xl, ${radiusTokens.xl})`,
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glow: `0 0 20px var(--glow-brand, ${glowTokens.dark.glowBrand})`,
        'glow-strong': `0 0 32px var(--glow-brand-strong, ${glowTokens.dark.glowBrandStrong})`,
        'glow-purple': `0 0 20px var(--glow-purple, ${glowTokens.dark.glowPurple})`,
      },
      backdropBlur: {
        glass: `var(--glass-blur, ${glassTokens.dark.glassBlur})`,
      },
    },
  },
}
