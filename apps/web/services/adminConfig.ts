/**
 * Admin Configuration Service
 *
 * Sprint 23: Admin & White-Label Configuration
 * Manages tenant-level platform configuration: branding, theme, navigation, features.
 */
import { get, patch, post, put } from './api-client'

// ============================================================================
// Types
// ============================================================================

export interface BrandingConfig {
  appName: string
  logoUrl: string | null
  faviconUrl: string | null
  primaryColor: string
  secondaryColor: string
}

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  density: 'comfortable' | 'compact' | 'spacious'
  borderRadius: 'none' | 'sm' | 'md' | 'lg'
  fontFamily: string
}

export interface NavigationItem {
  id: string
  label: string
  path: string
  icon: string
  order: number
  enabled: boolean
  roles: string[]
}

export interface NotificationConfig {
  emailEnabled: boolean
  pushEnabled: boolean
  systemAlertsEnabled: boolean
  weeklyReportsEnabled: boolean
}

export interface PlatformConfig {
  branding: BrandingConfig
  theme: ThemeConfig
  navigation: NavigationItem[]
  notifications: NotificationConfig
  maintenanceMode: boolean
  defaultLanguage: string
  defaultTimezone: string
  setupComplete: boolean
  updatedAt: string | null
}

export type PartialPlatformConfig = Partial<{
  branding: Partial<BrandingConfig>
  theme: Partial<ThemeConfig>
  navigation: NavigationItem[]
  notifications: Partial<NotificationConfig>
  maintenanceMode: boolean
  defaultLanguage: string
  defaultTimezone: string
  setupComplete: boolean
}>

// ============================================================================
// Default Config
// ============================================================================

export const DEFAULT_BRANDING: BrandingConfig = {
  appName: 'Template Platform',
  logoUrl: null,
  faviconUrl: null,
  primaryColor: '#0087A8',
  secondaryColor: '#6366f1',
}

export const DEFAULT_THEME: ThemeConfig = {
  mode: 'system',
  density: 'comfortable',
  borderRadius: 'md',
  fontFamily: 'Inter, sans-serif',
}

export const DEFAULT_NOTIFICATIONS: NotificationConfig = {
  emailEnabled: true,
  pushEnabled: true,
  systemAlertsEnabled: true,
  weeklyReportsEnabled: false,
}

export const DEFAULT_CONFIG: PlatformConfig = {
  branding: DEFAULT_BRANDING,
  theme: DEFAULT_THEME,
  navigation: [],
  notifications: DEFAULT_NOTIFICATIONS,
  maintenanceMode: false,
  defaultLanguage: 'pt-BR',
  defaultTimezone: 'America/Sao_Paulo',
  setupComplete: false,
  updatedAt: null,
}

// ============================================================================
// Config Merger
// ============================================================================

export function mergeConfig(base: PlatformConfig, partial: PartialPlatformConfig): PlatformConfig {
  return {
    ...base,
    ...partial,
    branding: partial.branding ? { ...base.branding, ...partial.branding } : base.branding,
    theme: partial.theme ? { ...base.theme, ...partial.theme } : base.theme,
    notifications: partial.notifications
      ? { ...base.notifications, ...partial.notifications }
      : base.notifications,
    navigation: partial.navigation ?? base.navigation,
  }
}

// ============================================================================
// Config Validators
// ============================================================================

export function validateBranding(branding: Partial<BrandingConfig>): string[] {
  const errors: string[] = []
  if (branding.appName !== undefined && branding.appName.trim().length === 0) {
    errors.push('appName cannot be empty')
  }
  if (branding.primaryColor !== undefined && !/^#[0-9a-fA-F]{6}$/.test(branding.primaryColor)) {
    errors.push('primaryColor must be a valid hex color (#rrggbb)')
  }
  if (branding.secondaryColor !== undefined && !/^#[0-9a-fA-F]{6}$/.test(branding.secondaryColor)) {
    errors.push('secondaryColor must be a valid hex color (#rrggbb)')
  }
  return errors
}

export function validateTheme(theme: Partial<ThemeConfig>): string[] {
  const errors: string[] = []
  if (theme.mode !== undefined && !['light', 'dark', 'system'].includes(theme.mode)) {
    errors.push('mode must be light, dark, or system')
  }
  if (
    theme.density !== undefined &&
    !['comfortable', 'compact', 'spacious'].includes(theme.density)
  ) {
    errors.push('density must be comfortable, compact, or spacious')
  }
  if (
    theme.borderRadius !== undefined &&
    !['none', 'sm', 'md', 'lg'].includes(theme.borderRadius)
  ) {
    errors.push('borderRadius must be none, sm, md, or lg')
  }
  return errors
}

export function validateNavigationItem(item: Partial<NavigationItem>): string[] {
  const errors: string[] = []
  if (!item.id || item.id.trim().length === 0) errors.push('id is required')
  if (!item.label || item.label.trim().length === 0) errors.push('label is required')
  if (!item.path || item.path.trim().length === 0) errors.push('path is required')
  return errors
}

// ============================================================================
// Navigation Helpers
// ============================================================================

export function reorderNavigation(
  items: NavigationItem[],
  fromIndex: number,
  toIndex: number
): NavigationItem[] {
  if (fromIndex === toIndex) return items
  if (fromIndex < 0 || toIndex < 0) return items
  if (fromIndex >= items.length || toIndex >= items.length) return items

  const result = [...items]
  const [moved] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, moved)
  return result.map((item, idx) => ({ ...item, order: idx }))
}

export function toggleNavigationItem(items: NavigationItem[], itemId: string): NavigationItem[] {
  return items.map(item => (item.id === itemId ? { ...item, enabled: !item.enabled } : item))
}

export function addNavigationItem(
  items: NavigationItem[],
  newItem: Omit<NavigationItem, 'order'>
): NavigationItem[] {
  const order = items.length
  return [...items, { ...newItem, order }]
}

export function removeNavigationItem(items: NavigationItem[], itemId: string): NavigationItem[] {
  return items.filter(item => item.id !== itemId).map((item, idx) => ({ ...item, order: idx }))
}

// ============================================================================
// API Service
// ============================================================================

const BASE = '/admin/config'

export const adminConfigService = {
  async getConfig(): Promise<PlatformConfig> {
    return get<PlatformConfig>(BASE)
  },

  async updateConfig(partial: PartialPlatformConfig): Promise<PlatformConfig> {
    return patch<PlatformConfig>(BASE, partial)
  },

  async resetConfig(): Promise<PlatformConfig> {
    return post<PlatformConfig>(`${BASE}/reset`)
  },

  async updateBranding(branding: Partial<BrandingConfig>): Promise<PlatformConfig> {
    return patch<PlatformConfig>(`${BASE}/branding`, branding)
  },

  async updateNavigation(navigation: NavigationItem[]): Promise<PlatformConfig> {
    return put<PlatformConfig>(`${BASE}/navigation`, { navigation })
  },
}
