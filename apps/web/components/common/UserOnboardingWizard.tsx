'use client'

/**
 * UserOnboardingWizard — Onboarding guiado para novos usuários
 *
 * 5 passos com progresso salvo em profiles.onboarding_step via API.
 * Exibido como overlay quando onboarding_step < 5.
 */

import { useState, useCallback } from 'react'
import { User, Headphones, UserPlus, Bell, LayoutDashboard, Check, X } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: typeof User
  action?: string
  actionHref?: string
}

const STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Complete seu perfil',
    description: 'Adicione seu nome, foto e informações de contato.',
    icon: User,
    action: 'Ir para Perfil',
    actionHref: '/profile',
  },
  {
    id: 'ticket',
    title: 'Abra seu primeiro ticket',
    description: 'Conheça o sistema de suporte criando um chamado de teste.',
    icon: Headphones,
    action: 'Novo Ticket',
    actionHref: '/support/tickets/new',
  },
  {
    id: 'invite',
    title: 'Convide um colega',
    description: 'Compartilhe a plataforma com sua equipe.',
    icon: UserPlus,
    action: 'Gestão de Usuários',
    actionHref: '/admin/usuarios',
  },
  {
    id: 'notifications',
    title: 'Configure notificações',
    description: 'Escolha como e quando receber alertas.',
    icon: Bell,
    action: 'Configurações',
    actionHref: '/admin/config/notificacoes',
  },
  {
    id: 'explore',
    title: 'Explore o dashboard',
    description: 'Veja métricas, tarefas e atalhos do seu painel.',
    icon: LayoutDashboard,
    action: 'Ir para Dashboard',
    actionHref: '/dashboard',
  },
]

interface UserOnboardingWizardProps {
  currentStep: number
  onStepComplete: (step: number) => void
  onDismiss: () => void
}

export function UserOnboardingWizard({
  currentStep,
  onStepComplete,
  onDismiss,
}: UserOnboardingWizardProps) {
  const [localStep, setLocalStep] = useState(currentStep)

  const handleComplete = useCallback(async () => {
    const nextStep = localStep + 1
    try {
      await fetch('/api/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: nextStep }),
      })
    } catch {
      // Continuar mesmo se API falhar
    }
    onStepComplete(nextStep)
    setLocalStep(nextStep)
  }, [localStep, onStepComplete])

  if (localStep >= STEPS.length) return null

  const step = STEPS[localStep]
  const StepIcon = step.icon
  const progress = ((localStep + 1) / STEPS.length) * 100

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 animate-page-enter">
      <div
        className="rounded-xl border border-[rgba(255,255,255,0.08)] shadow-2xl overflow-hidden"
        style={{
          background: 'rgba(24,24,27,0.95)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-[rgba(255,255,255,0.04)]">
          <div
            className="h-full bg-[var(--brand-primary)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Passo {localStep + 1} de {STEPS.length}
          </span>
          <button
            onClick={onDismiss}
            className="p-1 rounded-md hover:bg-white/[0.04] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Fechar onboarding"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10 flex-shrink-0">
              <StepIcon size={20} className="text-[var(--brand-primary)]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-[var(--text-primary)]">{step.title}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{step.description}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-4 pb-3">
          {step.actionHref && (
            <a
              href={step.actionHref}
              className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:bg-white/[0.04] transition-colors text-center"
            >
              {step.action}
            </a>
          )}
          <button
            onClick={handleComplete}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-colors"
          >
            <Check size={12} />
            Concluído
          </button>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 pb-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i < localStep
                  ? 'bg-[var(--brand-primary)]'
                  : i === localStep
                    ? 'bg-[var(--brand-primary)]/50'
                    : 'bg-[rgba(255,255,255,0.08)]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
