/**
 * @template/tokens — Design tokens centralizados
 *
 * Tokens de brand, semantic, spacing e radius usados por todas as apps derivadas.
 * Export como objeto TS e como CSS custom properties string.
 */

export const brandTokens = {
  primary: '#00b4d8',
  secondary: '#005F73',
  accent: '#94D2BD',
} as const

export const accentTokens = {
  purple: '#a78bfa',
  amber: '#fbbf24',
  emerald: '#34d399',
  rose: '#fb7185',
} as const

export const radiusTokens = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
} as const

export const spacingTokens = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const

export const semanticTokens = {
  light: {
    bgRoot: '#ffffff',
    bgSurface: '#f8fafc',
    bgElevated: '#ffffff',
    bgMuted: '#f1f5f9',
    bgSubtle: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    textDisabled: '#cbd5e1',
    borderDefault: '#e2e8f0',
    borderMuted: '#f1f5f9',
    borderStrong: '#cbd5e1',
  },
  dark: {
    bgRoot: '#09090b',
    bgSurface: 'rgba(24,24,27,0.72)',
    bgElevated: 'rgba(39,39,42,0.8)',
    bgMuted: 'rgba(39,39,42,0.5)',
    bgSubtle: 'rgba(63,63,70,0.3)',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    textDisabled: '#52525b',
    borderDefault: 'rgba(255,255,255,0.06)',
    borderMuted: 'rgba(255,255,255,0.03)',
    borderStrong: 'rgba(255,255,255,0.12)',
  },
} as const

/** Gera string CSS custom properties para injetar via <style> ou theme provider */
export function tokensToCssVars(mode: 'light' | 'dark' = 'dark'): string {
  const sem = semanticTokens[mode]
  return [
    `--brand-primary: ${brandTokens.primary}`,
    `--brand-secondary: ${brandTokens.secondary}`,
    `--brand-accent: ${brandTokens.accent}`,
    `--accent-purple: ${accentTokens.purple}`,
    `--accent-amber: ${accentTokens.amber}`,
    `--accent-emerald: ${accentTokens.emerald}`,
    `--accent-rose: ${accentTokens.rose}`,
    `--radius-sm: ${radiusTokens.sm}`,
    `--radius-md: ${radiusTokens.md}`,
    `--radius-lg: ${radiusTokens.lg}`,
    `--radius-xl: ${radiusTokens.xl}`,
    `--bg-root: ${sem.bgRoot}`,
    `--bg-surface: ${sem.bgSurface}`,
    `--bg-elevated: ${sem.bgElevated}`,
    `--bg-muted: ${sem.bgMuted}`,
    `--bg-subtle: ${sem.bgSubtle}`,
    `--text-primary: ${sem.textPrimary}`,
    `--text-secondary: ${sem.textSecondary}`,
    `--text-muted: ${sem.textMuted}`,
    `--text-disabled: ${sem.textDisabled}`,
    `--border-default: ${sem.borderDefault}`,
    `--border-muted: ${sem.borderMuted}`,
    `--border-strong: ${sem.borderStrong}`,
  ].join(';\n')
}

export type BrandTokens = typeof brandTokens
export type AccentTokens = typeof accentTokens
export type RadiusTokens = typeof radiusTokens
export type SemanticTokens = typeof semanticTokens
