'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronRight, ChevronUp } from 'lucide-react'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { ModuleFunctionsPanel } from '@/components/navigation'
import { GlobalSearch, useGlobalSearch } from '@/components/search'
import { FirstRunWizard } from '@/components/common/FirstRunWizard'
import { usePlatformConfig, useIsSetupComplete } from '@/hooks/usePlatformConfig'
import { usePlatformBranding } from '@/hooks/usePlatformBranding'
import { useNavigationConfig } from '@/hooks/useNavigationConfig'
import { NAVIGATION } from '@/navigation/map'
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
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false)
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
    setIsMobilePanelOpen(false)
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

  // Verificar se o módulo atual tem funções para mostrar o painel
  const hasModuleFunctions = NAVIGATION.modules.some(module => {
    const isModuleActive = pathname === module.path || pathname.startsWith(module.path + '/')

    const isFunctionActive = module.functions?.some(
      func => pathname === func.path || pathname.startsWith(func.path + '/')
    )

    return (isModuleActive || isFunctionActive) && module.functions && module.functions.length > 0
  })

  // Calcular margem do conteúdo principal
  const getContentMargin = () => {
    if (isMobile) return '0'
    if (hasModuleFunctions && isPanelOpen) {
      return `calc(${effectiveCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'} + var(--functions-panel-width, 260px))`
    }
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

      {/* ── Functions Panel — desktop/tablet: side panel ── */}
      {hasModuleFunctions && !isMobile && (
        <>
          <ModuleFunctionsPanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
            sidebarCollapsed={effectiveCollapsed}
          />
          {!isPanelOpen && (
            <button
              onClick={() => setIsPanelOpen(true)}
              className={clsx(
                'fixed top-1/2 -translate-y-1/2 z-50',
                'w-6 h-10 flex items-center justify-center',
                'rounded-r-lg border border-l-0 border-[var(--border-default)]',
                'bg-[var(--surface-base)] text-[var(--text-secondary)]',
                'hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
                'shadow-sm transition-all duration-300',
                effectiveCollapsed
                  ? 'left-[var(--sidebar-collapsed-width)]'
                  : 'left-[var(--sidebar-width)]'
              )}
              title="Abrir painel de funções"
              aria-label="Abrir painel de funções"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </>
      )}

      {/* ── Functions Panel — mobile: bottom sheet ── */}
      {hasModuleFunctions && isMobile && (
        <>
          {/* Backdrop */}
          <div
            className={clsx(
              'fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300',
              isMobilePanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            onClick={() => setIsMobilePanelOpen(false)}
            aria-hidden="true"
          />
          {/* Sheet */}
          <div
            className={clsx(
              'fixed inset-x-0 bottom-0 z-[70]',
              'max-h-[75dvh] rounded-t-2xl',
              'bg-[var(--surface-base)] border-t border-[var(--border-default)]',
              'shadow-2xl transition-transform duration-300 ease-out',
              isMobilePanelOpen ? 'translate-y-0' : 'translate-y-full'
            )}
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-[var(--text-muted)] opacity-40" />
            </div>
            <div className="overflow-y-auto max-h-[calc(75dvh-24px)] pb-safe">
              <ModuleFunctionsPanel
                isOpen={true}
                onClose={() => setIsMobilePanelOpen(false)}
                sidebarCollapsed={false}
                mobileSheet
              />
            </div>
          </div>

          {/* Floating toggle button */}
          {!isMobilePanelOpen && (
            <button
              onClick={() => setIsMobilePanelOpen(true)}
              className={clsx(
                'fixed bottom-4 right-4 z-50',
                'w-12 h-12 flex items-center justify-center',
                'rounded-full shadow-lg',
                'bg-[var(--brand-primary)] text-white',
                'hover:bg-[var(--brand-primary-hover)]',
                'transition-all duration-200 active:scale-95'
              )}
              title="Abrir funções do módulo"
              aria-label="Abrir funções do módulo"
            >
              <ChevronUp size={20} />
            </button>
          )}
        </>
      )}

      {/* ── Main content ── */}
      <div
        className={clsx('flex-1 flex flex-col transition-all duration-300', isMobile && '!ml-0')}
        style={{ marginLeft: isMobile ? undefined : getContentMargin() }}
      >
        <Header
          showPanelToggle={hasModuleFunctions && !isMobile}
          isPanelOpen={isPanelOpen}
          onTogglePanel={() => setIsPanelOpen(prev => !prev)}
          onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
          isMobile={isMobile}
        />
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
