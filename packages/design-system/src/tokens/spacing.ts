/**
 * Design Tokens - Spacing
 *
 * Sistema de espaçamento baseado em múltiplos de 4px.
 */

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const

// Border Radius — Dark Glass Engineering scale
export const radius = {
  none: '0',
  xs: '0.125rem', // 2px
  sm: '0.375rem', // 6px
  DEFAULT: '0.5rem', // 8px (md)
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem', // 32px
  full: '9999px',
} as const

// Shadows — layered para dark theme com profundidade real
export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
  md: '0 4px 12px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 40px rgba(0, 0, 0, 0.6)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  // Glow shadows — para CTAs, focus states, destaques
  glow: '0 0 20px rgba(0, 180, 216, 0.15)',
  glowStrong: '0 0 30px rgba(0, 180, 216, 0.25)',
  glowPurple: '0 0 20px rgba(167, 139, 250, 0.15)',
  // Focus rings
  focus: '0 0 0 3px rgba(0, 180, 216, 0.2)',
  focusError: '0 0 0 3px rgba(239, 68, 68, 0.2)',
} as const

// Z-Index
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const

export type SpacingKey = keyof typeof spacing
export type RadiusKey = keyof typeof radius
export type ShadowKey = keyof typeof shadows
export type ZIndexKey = keyof typeof zIndex
