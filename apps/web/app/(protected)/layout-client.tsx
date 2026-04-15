'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { SkipLink } from '@/components/common/SkipLink'
import { FirstRunWizard, type WizardData } from '@/components/common/FirstRunWizard'
import { AgentChat } from '@/components/chat/AgentChat'
import { useOnboarding } from '@/hooks/useOnboarding'
import { ToastProvider } from '@template/design-system'

// Rotas críticas para pré-busca antecipada
const PREFETCH_ROUTES = ['/dashboard', '/admin/config', '/admin/usuarios', '/profile']

export function ProtectedLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { shouldShowWizard, advanceStep, completeOnboarding, skipOnboarding } = useOnboarding()

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

  // Ctrl+K / Cmd+K agora é gerenciado pelo GlobalSearchProvider (providers.tsx)
  // Removido listener duplicado — fonte única de verdade no contexto global

  return (
    <ToastProvider>
      <SkipLink />
      <AppLayout>{children}</AppLayout>
      {shouldShowWizard && (
        <FirstRunWizard
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
          onStepChange={advanceStep}
          initialStep={0}
        />
      )}
      {/* Conversation OS — agente flutuante disponível em todas as páginas protegidas */}
      <AgentChat appId="web" />
    </ToastProvider>
  )
}
