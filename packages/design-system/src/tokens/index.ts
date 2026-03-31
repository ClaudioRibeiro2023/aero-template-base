/**
 * Design Tokens - Main Export
 */

export * from './colors'
export * from './spacing'
export * from './typography'
export * from './animation'

// Re-export all as single object for convenience
import { colors, surfaces, textColors, borderColors } from './colors'
import { spacing, radius, shadows, zIndex } from './spacing'
import {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  textStyles,
} from './typography'
import { duration, easing, transitions, keyframes, springPresets } from './animation'

export const tokens = {
  colors,
  surfaces,
  textColors,
  borderColors,
  spacing,
  radius,
  shadows,
  zIndex,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  textStyles,
  duration,
  easing,
  transitions,
  keyframes,
  springPresets,
} as const

export default tokens
