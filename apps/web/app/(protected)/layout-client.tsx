'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkipLink } from '@/components/common/SkipLink'
import { CommandPalette } from '@/components/common/CommandPalette'
import { FirstRunWizard, type WizardData } from '@/components/common/FirstRunWizard'
import { useOnboarding } from '@/hooks/useOnboarding'
import { ToastProvider } from '@template/design-system'

// Rotas críticas para pré-busca antecipada
const PREFETCH_ROUTES = ['/dashboard', '/admin/config', '/admin/usuarios', '/profile']

export function ProtectedLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isPaletteOpen, setIsPaletteOpen] = useState(false)
  const { shouldShowWizard, advanceStep, completeOnboarding, skipOnboarding } = useOnboarding()

  const closePalette = useCallback(() => setIsPaletteOpen(false), [])

  const handleWizardComplete = useCallback(
    async (_data: WizardData) => {
      await completeOnboarding()
    },
    [completeOnboarding]
  )

  const handleWizardSkip = useCallback(async () => {
    await skipOnboarding()
  }, [skipOnboarding])

  // Pré-buscar rotas críticas após mount para reduzir latência de navegação
  useEffect(() => {
    const timer = setTimeout(() => {
      PREFETCH_ROUTES.forEach(route => router.prefetch(route))
    }, 1000)
    return () => clearTimeout(timer)
  }, [router])

  // Atalho global Cmd+K / Ctrl+K para abrir a Command Palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsPaletteOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <ToastProvider>
      <SkipLink />
      <AppLayout>{children}</AppLayout>
      <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} />
      {shouldShowWizard && (
        <FirstRunWizard
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
          onStepChange={advanceStep}
          initialStep={0}
        />
      )}
    </ToastProvider>
  )
}
