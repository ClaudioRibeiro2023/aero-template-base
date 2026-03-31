/**
 * Design Tokens - Colors
 *
 * Dark Glass Engineering — paleta dark-first com superfícies glass.
 * Customize estes valores para cada projeto derivado.
 */

export const colors = {
  // Brand Colors - Cores principais da marca
  brand: {
    primary: {
      50: '#E6F8FC',
      100: '#CCF1F9',
      200: '#99E3F3',
      300: '#66D5ED',
      400: '#33C7E7',
      500: '#00b4d8', // Default — cyan vibrante
      600: '#0090AD',
      700: '#006C82',
      800: '#004856',
      900: '#00242B',
    },
    secondary: {
      50: '#E6F2F4',
      100: '#CCE5E9',
      200: '#99CAD3',
      300: '#66B0BD',
      400: '#3395A7',
      500: '#005F73', // Default
      600: '#004C5C',
      700: '#003945',
      800: '#00262E',
      900: '#001317',
    },
    accent: {
      50: '#F4FAF8',
      100: '#E9F5F1',
      200: '#D3EBE3',
      300: '#BDE1D5',
      400: '#A7D7C7',
      500: '#94D2BD', // Default
      600: '#76A897',
      700: '#597E71',
      800: '#3B544B',
      900: '#1E2A26',
    },
  },

  // Accent Colors — paleta complementar para gráficos e destaques
  accents: {
    purple: '#a78bfa',
    amber: '#fbbf24',
    emerald: '#34d399',
    rose: '#fb7185',
  },

  // Semantic Colors - Estados e feedback
  semantic: {
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    info: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
  },

  // Neutral Colors - Zinc scale (dark-first)
  neutral: {
    0: '#FFFFFF',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // Glass surfaces — tokens para efeitos glassmorphism
  glass: {
    bg: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.1)',
    blur: '12px',
  },

  // Glow shadows
  glow: {
    brand: 'rgba(0, 180, 216, 0.15)',
    brandStrong: 'rgba(0, 180, 216, 0.25)',
    purple: 'rgba(167, 139, 250, 0.15)',
    error: 'rgba(239, 68, 68, 0.15)',
  },
} as const

// Tokens semânticos para surfaces (dark-first)
export const surfaces = {
  light: {
    base: colors.neutral[50],
    elevated: colors.neutral[0],
    muted: colors.neutral[100],
    subtle: colors.neutral[200],
    overlay: 'rgba(15, 23, 42, 0.5)',
  },
  dark: {
    root: colors.neutral[950], // #09090b — fundo principal
    base: colors.neutral[900], // #18181b — cards base
    elevated: colors.neutral[800], // #27272a — cards elevados
    muted: colors.neutral[700], // #3f3f46 — elementos recuados
    subtle: colors.neutral[600], // #52525b
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
} as const

// Tokens semânticos para texto (dark-first)
export const textColors = {
  light: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    muted: colors.neutral[500],
    disabled: colors.neutral[300],
    inverse: colors.neutral[0],
    link: colors.brand.primary[500],
    linkHover: colors.brand.primary[600],
  },
  dark: {
    primary: '#fafafa', // zinc-50
    secondary: '#a1a1aa', // zinc-400
    muted: '#71717a', // zinc-500
    disabled: colors.neutral[600],
    inverse: colors.neutral[900],
    link: colors.brand.primary[400],
    linkHover: colors.brand.primary[300],
  },
} as const

// Tokens semânticos para bordas
export const borderColors = {
  light: {
    default: colors.neutral[200],
    muted: colors.neutral[100],
    strong: colors.neutral[300],
    focus: colors.brand.primary[500],
  },
  dark: {
    default: colors.neutral[700],
    muted: colors.neutral[800],
    strong: colors.neutral[600],
    focus: colors.brand.primary[400],
  },
} as const

export type ColorScale = typeof colors.brand.primary
export type SemanticColor = keyof typeof colors.semantic
export type NeutralColor = keyof typeof colors.neutral
export type AccentColor = keyof typeof colors.accents
export type GlowColor = keyof typeof colors.glow
