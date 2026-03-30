/**
 * FirstRunWizard — Assistente de configuração inicial da plataforma.
 *
 * Sprint 24: Release 1.0
 * Exibido no primeiro login do admin quando setup_complete = false.
 * Steps: Branding → Cores → Admin → Módulos → Resumo
 */
import { useState, useEffect, useRef } from 'react'
import {
  Settings,
  Palette,
  User,
  LayoutGrid,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

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

    // Focar no primeiro elemento ao abrir
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

export const AVAILABLE_MODULES = [
  { id: 'dashboard', label: 'Dashboard', description: 'Visao geral e metricas' },
  { id: 'reports', label: 'Relatorios', description: 'Analises e exportacoes' },
  { id: 'users', label: 'Gestao de Usuarios', description: 'Administrar usuarios' },
  { id: 'config', label: 'Configuracoes', description: 'Parametros do sistema' },
]

const DEFAULT_WIZARD_DATA: WizardData = {
  appName: 'Template Platform',
  logoUrl: '',
  primaryColor: '#14b8a6',
  secondaryColor: '#6366f1',
  adminEmail: '',
  adminName: '',
  enabledModules: ['dashboard', 'users'],
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

export function FirstRunWizard({ onComplete, onSkip, initialData }: FirstRunWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
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
      setCurrentStep(i => i + 1)
      setErrors([])
    }
  }

  function handleBack() {
    if (!isFirst) {
      setCurrentStep(i => i - 1)
      setErrors([])
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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
    >
      <div
        ref={trapRef}
        className="bg-white dark:bg-[#1a1f2e] rounded-xl shadow-2xl w-full max-w-2xl border border-white/10"
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-border-default">
          <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
            <Settings className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 id="wizard-title" className="text-xl font-bold text-text-primary">
              Configuração Inicial
            </h2>
            <p className="text-sm text-text-secondary">Configure sua plataforma antes de começar</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1 px-6 pt-4" role="list" aria-label="Etapas do wizard">
          {WIZARD_STEPS.map((s, i) => (
            <div
              key={s.id}
              role="listitem"
              aria-current={i === currentStep ? 'step' : undefined}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < currentStep
                  ? 'bg-teal-500'
                  : i === currentStep
                    ? 'bg-teal-300'
                    : 'bg-surface-muted'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="p-6 min-h-[280px]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-text-primary">{step.title}</h3>
            <p className="text-sm text-text-secondary">{step.description}</p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div role="alert" className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {errors.map((e, i) => (
                <p key={i} className="text-sm text-red-600 dark:text-red-400">
                  {e}
                </p>
              ))}
            </div>
          )}

          {/* Step: Branding */}
          {step.id === 'branding' && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="app-name"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  Nome da Plataforma *
                </label>
                <input
                  id="app-name"
                  type="text"
                  value={data.appName}
                  onChange={e => update({ appName: e.target.value })}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-white dark:bg-gray-800 text-text-primary"
                  placeholder="Minha Plataforma"
                />
              </div>
              <div>
                <label
                  htmlFor="logo-url"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  URL do Logo (opcional)
                </label>
                <input
                  id="logo-url"
                  type="url"
                  value={data.logoUrl}
                  onChange={e => update({ logoUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-white dark:bg-gray-800 text-text-primary"
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
            </div>
          )}

          {/* Step: Colors */}
          {step.id === 'colors' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="primary-color"
                    className="block text-sm font-medium text-text-secondary mb-1"
                  >
                    Cor Primária
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="primary-color"
                      type="color"
                      value={data.primaryColor}
                      onChange={e => update({ primaryColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={data.primaryColor}
                      onChange={e => update({ primaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-border-default rounded-lg bg-surface-elevated text-text-primary font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="secondary-color"
                    className="block text-sm font-medium text-text-secondary mb-1"
                  >
                    Cor Secundária
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="secondary-color"
                      type="color"
                      value={data.secondaryColor}
                      onChange={e => update({ secondaryColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={data.secondaryColor}
                      onChange={e => update({ secondaryColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-border-default rounded-lg bg-surface-elevated text-text-primary font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              <div
                className="p-4 rounded-lg border border-border-default"
                style={{ borderLeftColor: data.primaryColor, borderLeftWidth: 4 }}
              >
                <p className="text-sm font-medium" style={{ color: data.primaryColor }}>
                  Prévia: {data.appName}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  As cores serão aplicadas em toda a plataforma
                </p>
              </div>
            </div>
          )}

          {/* Step: Admin */}
          {step.id === 'admin' && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="admin-name"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  Nome Completo *
                </label>
                <input
                  id="admin-name"
                  type="text"
                  value={data.adminName}
                  onChange={e => update({ adminName: e.target.value })}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-white dark:bg-gray-800 text-text-primary"
                  placeholder="João Silva"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  Email *
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={data.adminEmail}
                  onChange={e => update({ adminEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-border-default rounded-lg bg-white dark:bg-gray-800 text-text-primary"
                  placeholder="admin@empresa.com"
                />
              </div>
            </div>
          )}

          {/* Step: Modules */}
          {step.id === 'modules' && (
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map(mod => {
                const enabled = data.enabledModules.includes(mod.id)
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    aria-pressed={enabled}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      enabled
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-border-default hover:border-text-muted'
                    }`}
                  >
                    <p className="font-medium text-sm text-text-primary">{mod.label}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{mod.description}</p>
                  </button>
                )
              })}
            </div>
          )}

          {/* Step: Summary */}
          {step.id === 'summary' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg">
                <Palette className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{data.appName}</p>
                  <p className="text-xs text-text-muted">
                    Cores: {data.primaryColor} / {data.secondaryColor}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg">
                <User className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{data.adminName}</p>
                  <p className="text-xs text-text-muted">{data.adminEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-surface-muted rounded-lg">
                <LayoutGrid className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {data.enabledModules.length} módulo(s) habilitado(s)
                  </p>
                  <p className="text-xs text-text-muted">{data.enabledModules.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <p className="text-sm text-teal-700 dark:text-teal-300">
                  Tudo pronto! Clique em &ldquo;Iniciar Plataforma&rdquo; para continuar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border-default">
          <div className="flex gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </button>
            )}
            {onSkip && isFirst && (
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-secondary transition-colors"
              >
                Pular por agora
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isLast ? 'Iniciar Plataforma' : 'Próximo'}
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FirstRunWizard
