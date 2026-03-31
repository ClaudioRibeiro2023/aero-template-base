/**
 * Platform Presets
 *
 * Branding configurations for the platform. The default preset provides
 * sensible defaults. The custom preset reads from environment variables,
 * allowing full customization without code changes.
 *
 * Usage:
 *   import { PRESET_DEFAULT, PRESET_CUSTOM } from '@/config/platform-presets'
 */

import type { NavigationConfig } from './navigation-schema'

type PresetOverride = Pick<NavigationConfig, 'appName' | 'appVersion' | 'logoUrl' | 'branding'>

/** Default branding (teal/cyan) */
export const PRESET_DEFAULT: PresetOverride = {
  appName: 'Template Platform',
  appVersion: '1.0.0',
  branding: {
    primaryColor: '#0087A8',
    secondaryColor: '#005F73',
    accentColor: '#94D2BD',
    sidebarGradient: ['#0f172a', '#1e293b'],
  },
}

/**
 * Custom preset — reads from environment variables.
 * Configure via .env:
 *   VITE_APP_NAME, VITE_APP_VERSION,
 *   VITE_PRIMARY_COLOR, VITE_SECONDARY_COLOR, VITE_ACCENT_COLOR,
 *   VITE_LOGO_URL
 */
const env =
  typeof import.meta !== 'undefined'
    ? ((import.meta as unknown as { env?: Record<string, string> }).env ?? {})
    : {}

export const PRESET_CUSTOM: PresetOverride = {
  appName: env.VITE_APP_NAME || PRESET_DEFAULT.appName,
  appVersion: env.VITE_APP_VERSION || PRESET_DEFAULT.appVersion,
  logoUrl: env.VITE_LOGO_URL || PRESET_DEFAULT.logoUrl,
  branding: {
    primaryColor: env.VITE_PRIMARY_COLOR || PRESET_DEFAULT.branding!.primaryColor,
    secondaryColor: env.VITE_SECONDARY_COLOR || PRESET_DEFAULT.branding!.secondaryColor,
    accentColor: env.VITE_ACCENT_COLOR || PRESET_DEFAULT.branding!.accentColor,
    sidebarGradient: PRESET_DEFAULT.branding!.sidebarGradient,
  },
}

/** Active preset — uses custom (env-driven) with default fallbacks */
export const ACTIVE_PRESET: PresetOverride = PRESET_CUSTOM

/** All presets indexed by key */
export const PRESETS: Record<string, PresetOverride> = {
  default: PRESET_DEFAULT,
  custom: PRESET_CUSTOM,
}

export default PRESETS
