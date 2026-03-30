/**
 * usePlatformBranding Hook
 *
 * Applies CSS custom properties from NavigationConfig.branding to :root,
 * enabling per-platform visual customization of sidebar gradient, brand colors, etc.
 *
 * Sprint S5: Multi-Platform Config
 */

import { useEffect } from 'react'
import type { BrandingConfig } from '@/config/navigation-schema'

/**
 * Applies branding overrides from config to CSS custom properties on :root.
 * Also handles favicon override.
 */
export function usePlatformBranding(branding?: BrandingConfig): void {
  useEffect(() => {
    if (!branding) return

    const root = document.documentElement

    // Apply simple color overrides
    if (branding.primaryColor) {
      root.style.setProperty('--brand-primary', branding.primaryColor)
    }
    if (branding.secondaryColor) {
      root.style.setProperty('--brand-secondary', branding.secondaryColor)
    }
    if (branding.accentColor) {
      root.style.setProperty('--brand-accent', branding.accentColor)
    }

    // Apply sidebar gradient
    if (branding.sidebarGradient && branding.sidebarGradient.length >= 2) {
      root.style.setProperty('--sidebar-gradient-start', branding.sidebarGradient[0])
      root.style.setProperty('--sidebar-gradient-end', branding.sidebarGradient[1])
    }

    // Apply sidebar background
    if (branding.sidebarBg) {
      root.style.setProperty('--sidebar-bg', branding.sidebarBg)
    }

    // Apply favicon override
    if (branding.faviconUrl) {
      const link =
        (document.querySelector("link[rel='icon']") as HTMLLinkElement) ||
        document.createElement('link')
      link.rel = 'icon'
      link.href = branding.faviconUrl
      if (!link.parentNode) document.head.appendChild(link)
    }

    // Cleanup: remove overrides on unmount or branding change
    return () => {
      const props = [
        '--brand-primary',
        '--brand-secondary',
        '--brand-accent',
        '--sidebar-gradient-start',
        '--sidebar-gradient-end',
        '--sidebar-bg',
      ]
      props.forEach(p => root.style.removeProperty(p))
    }
  }, [branding])
}

export default usePlatformBranding
