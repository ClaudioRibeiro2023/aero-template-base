/**
 * FirstRunWizard — Assistente de configuração inicial da plataforma.
 *
 * Sprint 24: Release 1.0
 * Visual Sprint 4: Redesign Dark Glass
 * Exibido no primeiro login do admin quando setup_complete = false.
 * Steps: Branding → Cores → Admin → Módulos → Resumo
 */
import { useState, useEffect, useRef } from 'react'
import {
  WizardLayout,
  WizardStepBranding,
  WizardStepColors,
  WizardStepAdmin,
  WizardStepModules,
  WizardStepSummary,
} from './wizard'

// Focus trap: mantém o foco dentro do dialog enquanto está aberto
function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !ref.current) return

    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    first?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (focusable.length === 0) {
        e.preventDefault()
        return
      }

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [active])

  return ref
}

// ============================================================================
// Types
// ============================================================================

export interface WizardStep {
  id: string
  title: string
  description: string
}

export interface WizardData {
  appName: string
  logoUrl: string
  primaryColor: string
  secondaryColor: string
  adminEmail: string
  adminName: string
  enabledModules: string[]
}

export interface FirstRunWizardProps {
  onComplete: (data: WizardData) => void
  onSkip?: () => void
  onStepChange?: (step: number) => void
  initialStep?: number
  initialData?: Partial<WizardData>
}

// ============================================================================
// Constants
// ============================================================================

export const WIZARD_STEPS: WizardStep[] = [
  { id: 'branding', title: 'Identidade da Plataforma', description: 'Nome e logo' },
  { id: 'colors', title: 'Cores e Tema', description: 'Paleta de cores' },
  { id: 'admin', title: 'Usuário Administrador', description: 'Conta principal' },
  { id: 'modules', title: 'Módulos Habilitados', description: 'Funcionalidades' },
  { id: 'summary', title: 'Resumo', description: 'Confirmar e iniciar' },
]

// Módulos disponíveis derivados dos manifests do sistema modular.
// Core modules não aparecem (são always-on). Utility modules também não.
// Exibe: default + optional, com categoria visual.
export const AVAILABLE_MODULES = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { allManifests } = require('@/config/modules')
    return (
      allManifests as Array<{ id: string; name: string; description: string; category: string }>
    )
      .filter(m => m.category === 'default' || m.category === 'optional')
      .map(m => ({
        id: m.id,
        label: m.name,
        description: m.description,
        isDefault: m.category === 'default',
      }))
  } catch {
    // Fallback estático caso manifests não carreguem
    return [
      {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'Painel com KPIs e metricas',
        isDefault: true,
      },
      { id: 'reports', label: 'Relatorios', description: 'Relatorios gerenciais', isDefault: true },
      { id: 'tasks', label: 'Tarefas', description: 'Gerenciamento de tarefas', isDefault: false },
      { id: 'support', label: 'Suporte', description: 'Tickets de suporte', isDefault: false },
      {
        id: 'notifications',
        label: 'Notificacoes',
        description: 'Centro de notificacoes',
        isDefault: false,
      },
      {
        id: 'feature-flags',
        label: 'Feature Flags',
        description: 'Rollout progressivo',
        isDefault: false,
      },
      {
        id: 'organizations',
        label: 'Organizacoes',
        description: 'Multi-tenancy',
        isDefault: false,
      },
    ]
  }
})()

const DEFAULT_WIZARD_DATA: WizardData = {
  appName: 'Template Platform',
  logoUrl: '',
  primaryColor: '#00b4d8',
  secondaryColor: '#a78bfa',
  adminEmail: '',
  adminName: '',
  enabledModules: AVAILABLE_MODULES.filter(m => m.isDefault).map(m => m.id),
}

// ============================================================================
// Validation
// ============================================================================

export function validateWizardStep(step: string, data: WizardData): string[] {
  const errors: string[] = []
  if (step === 'branding') {
    if (!data.appName.trim()) errors.push('Nome da plataforma é obrigatório')
  }
  if (step === 'colors') {
    if (!/^#[0-9a-fA-F]{6}$/.test(data.primaryColor))
      errors.push('Cor primária deve ser um hex válido (#rrggbb)')
    if (!/^#[0-9a-fA-F]{6}$/.test(data.secondaryColor))
      errors.push('Cor secundária deve ser um hex válido (#rrggbb)')
  }
  if (step === 'admin') {
    if (!data.adminName.trim()) errors.push('Nome do administrador é obrigatório')
    if (!data.adminEmail.trim()) errors.push('Email do administrador é obrigatório')
    if (data.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminEmail))
      errors.push('Email inválido')
  }
  if (step === 'modules') {
    if (data.enabledModules.length === 0) errors.push('Habilite ao menos um módulo')
  }
  return errors
}

// ============================================================================
// Component
// ============================================================================

export function FirstRunWizard({
  onComplete,
  onSkip,
  onStepChange,
  initialStep = 0,
  initialData,
}: FirstRunWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [data, setData] = useState<WizardData>({ ...DEFAULT_WIZARD_DATA, ...initialData })
  const [errors, setErrors] = useState<string[]>([])
  const trapRef = useFocusTrap(true)

  const step = WIZARD_STEPS[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === WIZARD_STEPS.length - 1

  function update(partial: Partial<WizardData>) {
    setData(prev => ({ ...prev, ...partial }))
    setErrors([])
  }

  function handleNext() {
    const stepErrors = validateWizardStep(step.id, data)
    if (stepErrors.length > 0) {
      setErrors(stepErrors)
      return
    }
    if (isLast) {
      onComplete(data)
    } else {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      setErrors([])
      onStepChange?.(nextStep)
    }
  }

  function handleBack() {
    if (!isFirst) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      setErrors([])
      onStepChange?.(prevStep)
    }
  }

  function toggleModule(moduleId: string) {
    const enabled = data.enabledModules.includes(moduleId)
    update({
      enabledModules: enabled
        ? data.enabledModules.filter(m => m !== moduleId)
        : [...data.enabledModules, moduleId],
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        ref={trapRef}
        className="w-full max-w-2xl overflow-hidden"
        style={{
          background: 'rgba(24, 24, 27, 0.85)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.06), 0 0 40px rgba(0,0,0,0.5), 0 25px 50px rgba(0,0,0,0.4)',
        }}
      >
        <WizardLayout
          currentStep={currentStep}
          isFirst={isFirst}
          isLast={isLast}
          errors={errors}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={onSkip}
          stepTitle={step.title}
          stepDescription={step.description}
        >
          {step.id === 'branding' && (
            <WizardStepBranding data={data} errors={errors} onUpdate={update} />
          )}
          {step.id === 'colors' && <WizardStepColors data={data} onUpdate={update} />}
          {step.id === 'admin' && <WizardStepAdmin data={data} errors={errors} onUpdate={update} />}
          {step.id === 'modules' && <WizardStepModules data={data} onToggleModule={toggleModule} />}
          {step.id === 'summary' && <WizardStepSummary data={data} />}
        </WizardLayout>
      </div>
    </div>
  )
}

export default FirstRunWizard
