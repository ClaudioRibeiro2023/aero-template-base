'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ScrollProgress } from '@/components/common/ScrollProgress'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { useGlobalSearch } from '@/components/search'
import { usePlatformConfig, useIsSetupComplete } from '@/hooks/usePlatformConfig'

import { usePlatformBranding } from '@/hooks/usePlatformBranding'
import { useNavigationConfig } from '@/hooks/useNavigationConfig'
import { useAuth } from '@/hooks/useAuth'
import clsx from 'clsx'

// Lazy: modal de busca global — não é necessário no render inicial do layout
const GlobalSearch = dynamic(() => import('@/components/search/GlobalSearch'), {
  loading: () => null,
  ssr: false,
})

// Lazy: wizard multi-step exibido apenas no primeiro uso — não bloqueia o render inicial
const FirstRunWizard = dynamic(
  () => import('@/components/common/FirstRunWizard').then(m => ({ default: m.FirstRunWizard })),
  {
    loading: () => null,
    ssr: false,
  }
)

// Lazy: onboarding guiado para novos usuários — carregado apenas quando necessário
const UserOnboardingWizard = dynamic(
  () =>
    import('@/components/common/UserOnboardingWizard').then(m => ({
      default: m.UserOnboardingWizard,
    })),
  { loading: () => null, ssr: false }
)

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed'
const WIZARD_DISMISSED_KEY = 'wizard-dismissed'

// ── Responsive breakpoints ──
type ScreenMode = 'mobile' | 'tablet' | 'desktop'

function useScreenMode(): ScreenMode {
  // SSR-safe: start with 'desktop' but immediately detect on mount
  const [mode, setMode] = useState<ScreenMode>(() => {
    if (typeof window === 'undefined') return 'desktop'
    const w = window.innerWidth
    return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
  })

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setMode(w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop')
    }
    update()
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { user } = useAuth()
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Restore sidebar collapsed state from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
    if (saved === 'true') setIsSidebarCollapsed(true)
  }, [])

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

  // Fetch onboarding step from profile (user-level onboarding)
  useEffect(() => {
    if (!user?.id) return
    fetch('/api/user/onboarding')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        const step = data?.step ?? 0
        if (step < 5) {
          setOnboardingStep(step)
          setShowOnboarding(true)
        }
      })
      .catch(() => {})
  }, [user?.id])

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false)
  }, [])

  // Touch swipe: open/close sidebar on mobile
  const handleSwipeRight = useCallback(() => {
    if (isMobile) setIsMobileMenuOpen(true)
  }, [isMobile])

  const handleSwipeLeft = useCallback(() => {
    if (isMobile) setIsMobileMenuOpen(false)
  }, [isMobile])

  useSwipe(handleSwipeRight, handleSwipeLeft, { edgeOnly: true, threshold: 50 })

  // Focus trap for mobile drawer
  const drawerRef = useFocusTrap<HTMLDivElement>(isMobile && isMobileMenuOpen)

  // Close mobile drawer on Escape
  useEffect(() => {
    if (!isMobile || !isMobileMenuOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobile, isMobileMenuOpen])

  // Calcular margem do conteúdo principal
  const getContentMargin = () => {
    if (isMobile) return '0'
    return effectiveCollapsed
      ? 'calc(var(--sidebar-collapsed-width) + 36px)'
      : 'calc(var(--sidebar-width) + 36px)'
  }

  return (
    <div className="flex min-h-[100dvh] bg-[var(--bg-root)]">
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
        ref={isMobile ? drawerRef : undefined}
        className={clsx(
          // Mobile: off-screen drawer
          isMobile && [
            'fixed inset-y-0 start-0 z-[70] w-[var(--sidebar-width)]',
            'transition-transform duration-300 ease-out',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          ],
          // Tablet / Desktop: static
          !isMobile && ''
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
        className={clsx('flex-1 flex flex-col transition-all duration-300', isMobile && '!ms-0')}
        style={{ marginInlineStart: isMobile ? undefined : getContentMargin() }}
      >
        <Header
          onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
          onSearchOpen={globalSearch.open}
          isMobile={isMobile}
          className="safe-area-top"
        />
        <main id="main-content" className="flex-1 ambient-gradient overflow-y-auto">
          {children}
        </main>
        <Footer className="safe-area-bottom" />
      </div>

      {/* Global Search (Ctrl+K) */}
      <GlobalSearch isOpen={globalSearch.isOpen} onClose={globalSearch.close} />

      {/* First-Run Wizard (Sprint 24) */}
      {showWizard && <FirstRunWizard onComplete={dismissWizard} onSkip={dismissWizard} />}

      {/* User Onboarding Wizard — guia novos usuários em 5 passos */}
      {showOnboarding && !showWizard && onboardingStep !== null && (
        <UserOnboardingWizard
          currentStep={onboardingStep}
          onStepComplete={step => setOnboardingStep(step)}
          onDismiss={dismissOnboarding}
        />
      )}

      <ScrollProgress />
    </div>
  )
}
