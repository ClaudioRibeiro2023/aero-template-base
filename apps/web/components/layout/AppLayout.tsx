'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { GlobalSearch, useGlobalSearch } from '@/components/search'
import { FirstRunWizard } from '@/components/common/FirstRunWizard'
import { usePlatformConfig, useIsSetupComplete } from '@/hooks/usePlatformConfig'
import { usePlatformBranding } from '@/hooks/usePlatformBranding'
import { useNavigationConfig } from '@/hooks/useNavigationConfig'
import clsx from 'clsx'

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed'
const WIZARD_DISMISSED_KEY = 'wizard-dismissed'

// ── Responsive breakpoints ──
type ScreenMode = 'mobile' | 'tablet' | 'desktop'

function useScreenMode(): ScreenMode {
  const [mode, setMode] = useState<ScreenMode>(() => {
    if (typeof window === 'undefined') return 'desktop'
    const w = window.innerWidth
    if (w < 768) return 'mobile'
    if (w < 1024) return 'tablet'
    return 'desktop'
  })

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setMode(w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop')
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return mode
}

// ── Touch swipe hook ──
function useSwipe(
  onSwipeRight: () => void,
  onSwipeLeft: () => void,
  options: { edgeOnly?: boolean; threshold?: number } = {}
) {
  const { edgeOnly = true, threshold = 50 } = options
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      // edgeOnly: only register swipes that start from left 30px edge (open) or anywhere (close)
      if (edgeOnly && touch.clientX > 30 && touch.clientX < window.innerWidth - 30) {
        touchStart.current = null
        return
      }
      touchStart.current = { x: touch.clientX, y: touch.clientY }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStart.current.x
      const dy = touch.clientY - touchStart.current.y

      // Only horizontal swipes (dx > dy)
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) onSwipeRight()
        else onSwipeLeft()
      }
      touchStart.current = null
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipeRight, onSwipeLeft, edgeOnly, threshold])
}

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname()
  const screen = useScreenMode()
  const isMobile = screen === 'mobile'
  const isTablet = screen === 'tablet'
  const globalSearch = useGlobalSearch()
  usePlatformConfig()
  const { config: navConfig } = useNavigationConfig()
  usePlatformBranding(navConfig?.branding)
  const { isComplete: isSetupComplete, isLoading: isSetupLoading } = useIsSetupComplete()
  const [showWizard, setShowWizard] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    return saved === 'true'
  })

  // Tablet auto-collapse sidebar
  const effectiveCollapsed = isTablet ? true : isSidebarCollapsed

  // Fechar menus ao mudar de página
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Persistir estado da sidebar
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  // Show FirstRunWizard if setup is not complete AND not previously dismissed
  useEffect(() => {
    if (!isSetupLoading && !isSetupComplete) {
      const wasDismissed = localStorage.getItem(WIZARD_DISMISSED_KEY) === 'true'
      if (!wasDismissed) {
        setShowWizard(true)
      }
    }
  }, [isSetupLoading, isSetupComplete])

  const dismissWizard = useCallback(() => {
    setShowWizard(false)
    localStorage.setItem(WIZARD_DISMISSED_KEY, 'true')
  }, [])

  // Touch swipe: open/close sidebar on mobile
  const handleSwipeRight = useCallback(() => {
    if (isMobile) setIsMobileMenuOpen(true)
  }, [isMobile])

  const handleSwipeLeft = useCallback(() => {
    if (isMobile) setIsMobileMenuOpen(false)
  }, [isMobile])

  useSwipe(handleSwipeRight, handleSwipeLeft, { edgeOnly: true, threshold: 50 })

  // Calcular margem do conteúdo principal
  const getContentMargin = () => {
    if (isMobile) return '0'
    return effectiveCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
  }

  return (
    <div className="flex min-h-[100dvh] bg-surface-base">
      {/* ── Mobile overlay (sidebar) ── */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 md:hidden',
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar ── */}
      <div
        className={clsx(
          // Mobile: off-screen drawer
          isMobile && [
            'fixed inset-y-0 left-0 z-[70] w-[var(--sidebar-width)]',
            'transition-transform duration-300 ease-out',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          ],
          // Tablet / Desktop: static
          !isMobile && 'relative'
        )}
      >
        <AppSidebar
          collapsed={isMobile ? false : effectiveCollapsed}
          onToggle={
            isMobile ? undefined : isTablet ? undefined : () => setIsSidebarCollapsed(prev => !prev)
          }
        />
      </div>

      {/* ── Main content ── */}
      <div
        className={clsx('flex-1 flex flex-col transition-all duration-300', isMobile && '!ml-0')}
        style={{ marginLeft: isMobile ? undefined : getContentMargin() }}
      >
        <Header onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)} isMobile={isMobile} />
        <main id="main-content" className="flex-1 p-4 md:p-6">
          {children}
        </main>
        <Footer />
      </div>

      {/* Global Search (Ctrl+K) */}
      <GlobalSearch isOpen={globalSearch.isOpen} onClose={globalSearch.close} />

      {/* First-Run Wizard (Sprint 24) */}
      {showWizard && <FirstRunWizard onComplete={dismissWizard} onSkip={dismissWizard} />}
    </div>
  )
}
