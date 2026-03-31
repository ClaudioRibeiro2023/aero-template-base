/**
 * Design Tokens - Animation
 *
 * Durações, easings, transições e spring presets.
 */

export const duration = {
  instant: '0ms',
  fast: '100ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms',
  slowest: '700ms',
  // Novas durações para micro-interactions
  microFast: '150ms',
  microSlow: '250ms',
  pageTransition: '400ms',
  modal: '350ms',
} as const

export const easing = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // Custom easings
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  // Expo easings — premium feel
  expoOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  expoIn: 'cubic-bezier(0.7, 0, 0.84, 0)',
  expoInOut: 'cubic-bezier(0.87, 0, 0.13, 1)',
} as const

// Spring presets (para framer-motion ou CSS spring())
export const springPresets = {
  snappy: { stiffness: 400, damping: 30, mass: 1 },
  smooth: { stiffness: 200, damping: 24, mass: 1 },
  gentle: { stiffness: 120, damping: 20, mass: 1 },
  bouncy: { stiffness: 300, damping: 15, mass: 1 },
} as const

// Transições pré-definidas
export const transitions = {
  none: 'none',
  all: `all ${duration.normal} ${easing.easeInOut}`,
  colors: `background-color ${duration.normal} ${easing.easeInOut}, border-color ${duration.normal} ${easing.easeInOut}, color ${duration.normal} ${easing.easeInOut}, fill ${duration.normal} ${easing.easeInOut}, stroke ${duration.normal} ${easing.easeInOut}`,
  opacity: `opacity ${duration.normal} ${easing.easeInOut}`,
  shadow: `box-shadow ${duration.normal} ${easing.easeInOut}`,
  transform: `transform ${duration.normal} ${easing.easeInOut}`,
  // Novas transições premium
  glass: `background-color ${duration.normal} ${easing.expoOut}, border-color ${duration.normal} ${easing.expoOut}, backdrop-filter ${duration.slow} ${easing.expoOut}`,
  page: `opacity ${duration.pageTransition} ${easing.expoOut}, transform ${duration.pageTransition} ${easing.expoOut}`,
  modal: `opacity ${duration.modal} ${easing.expoOut}, transform ${duration.modal} ${easing.expoOut}`,
} as const

// Keyframes para animações
export const keyframes = {
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  ping: {
    '0%': { transform: 'scale(1)', opacity: '1' },
    '75%, 100%': { transform: 'scale(2)', opacity: '0' },
  },
  pulse: {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' },
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: easing.bounce },
    '50%': { transform: 'translateY(0)', animationTimingFunction: easing.easeOut },
  },
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  fadeOut: {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },
  slideInUp: {
    from: { transform: 'translateY(10px)', opacity: '0' },
    to: { transform: 'translateY(0)', opacity: '1' },
  },
  slideInDown: {
    from: { transform: 'translateY(-10px)', opacity: '0' },
    to: { transform: 'translateY(0)', opacity: '1' },
  },
  slideInLeft: {
    from: { transform: 'translateX(-10px)', opacity: '0' },
    to: { transform: 'translateX(0)', opacity: '1' },
  },
  slideInRight: {
    from: { transform: 'translateX(10px)', opacity: '0' },
    to: { transform: 'translateX(0)', opacity: '1' },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: '0' },
    to: { transform: 'scale(1)', opacity: '1' },
  },
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  glowPulse: {
    '0%, 100%': { boxShadow: '0 0 12px rgba(0, 180, 216, 0.15)' },
    '50%': { boxShadow: '0 0 24px rgba(0, 180, 216, 0.25)' },
  },
} as const

export type DurationKey = keyof typeof duration
export type EasingKey = keyof typeof easing
export type TransitionKey = keyof typeof transitions
export type KeyframeKey = keyof typeof keyframes
export type SpringPresetKey = keyof typeof springPresets
