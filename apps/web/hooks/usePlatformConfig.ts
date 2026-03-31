/**
 * usePlatformConfig — Hook para configuração da plataforma white-label.
 *
 * Sprint 23: Admin & White-Label Configuration
 * Busca config pública do tenant, aplica CSS variables e document.title/favicon.
 */
import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, patch, post } from '../services/api-client'
import type { PlatformConfig, PartialPlatformConfig, BrandingConfig } from '../services/adminConfig'

// ============================================================================
// Query Keys
// ============================================================================

export const PLATFORM_CONFIG_KEYS = {
  all: ['platformConfig'] as const,
  public: () => [...PLATFORM_CONFIG_KEYS.all, 'public'] as const,
  admin: () => [...PLATFORM_CONFIG_KEYS.all, 'admin'] as const,
}

// ============================================================================
// Offline fallback — localStorage cache (TD-007)
// ============================================================================

const CACHE_KEY = 'platform_config_cache'

export function savePlatformConfigCache(config: PlatformConfig): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(config))
  } catch {
    // ignore storage errors (private browsing, quota exceeded)
  }
}

export function loadPlatformConfigCache(): PlatformConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as PlatformConfig) : null
  } catch {
    return null
  }
}

export function clearPlatformConfigCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // ignore
  }
}

// ============================================================================
// API calls
// ============================================================================

async function fetchPublicConfig(): Promise<PlatformConfig> {
  try {
    const data = await get<PlatformConfig>('/platform/public-config')
    savePlatformConfigCache(data)
    return data
  } catch (err) {
    const cached = loadPlatformConfigCache()
    if (cached) return cached
    throw err
  }
}

async function fetchAdminConfig(): Promise<PlatformConfig> {
  return get<PlatformConfig>('/admin/platform-config')
}

async function updateAdminConfig(partial: PartialPlatformConfig): Promise<PlatformConfig> {
  return patch<PlatformConfig>('/admin/platform-config', partial)
}

async function resetAdminConfig(): Promise<PlatformConfig> {
  return post<PlatformConfig>('/admin/platform-config/reset')
}

// ============================================================================
// CSS variable applicator
// ============================================================================

export function applyBrandingToCss(branding: BrandingConfig): void {
  const root = document.documentElement
  root.style.setProperty('--color-brand-primary', branding.primaryColor)
  root.style.setProperty('--color-brand-secondary', branding.secondaryColor)
}

export function applyDocumentMeta(branding: BrandingConfig): void {
  if (branding.appName) {
    document.title = branding.appName
  }
  if (branding.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = branding.faviconUrl
  }
}

// ============================================================================
// usePlatformConfig — Public (no auth required)
// ============================================================================

/**
 * Loads and applies the public platform configuration (branding, theme).
 * Automatically applies CSS variables and document meta on load.
 *
 * Usage:
 *   const { config, isLoading } = usePlatformConfig()
 */
export function usePlatformConfig() {
  const query = useQuery({
    queryKey: PLATFORM_CONFIG_KEYS.public(),
    queryFn: fetchPublicConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })

  useEffect(() => {
    if (query.data?.branding) {
      applyBrandingToCss(query.data.branding)
      applyDocumentMeta(query.data.branding)
    }
  }, [query.data])

  return {
    config: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

// ============================================================================
// useAdminPlatformConfig — Admin (auth required)
// ============================================================================

/**
 * Loads platform config for admin management.
 * Provides update and reset mutations.
 *
 * Usage:
 *   const { config, update, reset } = useAdminPlatformConfig()
 */
export function useAdminPlatformConfig() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: PLATFORM_CONFIG_KEYS.admin(),
    queryFn: fetchAdminConfig,
    staleTime: 60 * 1000, // 1 minute
  })

  const updateMutation = useMutation({
    mutationFn: updateAdminConfig,
    onSuccess: data => {
      queryClient.setQueryData(PLATFORM_CONFIG_KEYS.admin(), data)
      // Invalidate public config so it refetches
      queryClient.invalidateQueries({ queryKey: PLATFORM_CONFIG_KEYS.public() })
    },
  })

  const resetMutation = useMutation({
    mutationFn: resetAdminConfig,
    onSuccess: data => {
      queryClient.setQueryData(PLATFORM_CONFIG_KEYS.admin(), data)
      queryClient.invalidateQueries({ queryKey: PLATFORM_CONFIG_KEYS.public() })
    },
  })

  return {
    config: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error,
    reset: resetMutation.mutate,
    isResetting: resetMutation.isPending,
  }
}

// ============================================================================
// useIsSetupComplete
// ============================================================================

/**
 * Returns whether the platform first-run setup is complete.
 * Used to show/hide the FirstRunWizard.
 */
export function useIsSetupComplete(): { isComplete: boolean; isLoading: boolean } {
  const { config, isLoading } = usePlatformConfig()
  return {
    isComplete: config?.setupComplete ?? false,
    isLoading,
  }
}
