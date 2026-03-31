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
  { id: 'dashboard', label: 'Dashboard', description: 'Visão geral e métricas' },
  { id: 'reports', label: 'Relatórios', description: 'Análises e exportações' },
  { id: 'users', label: 'Gestão de Usuários', description: 'Administrar usuários' },
  { id: 'config', label: 'Configurações', description: 'Parâmetros do sistema' },
]

const DEFAULT_WIZARD_DATA: WizardData = {
  appName: 'Template Platform',
  logoUrl: '',
  primaryColor: '#00b4d8',
  secondaryColor: '#a78bfa',
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
// Shared input style helper
// ============================================================================

const inputBaseStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
}

function handleInputFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = '#00b4d8'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.15)'
}

function handleInputBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
  e.currentTarget.style.boxShadow = 'none'
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
        {/* Header */}
        <div
          className="flex items-center gap-3 p-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 40,
              height: 40,
              background: 'rgba(0,180,216,0.10)',
            }}
          >
            <Settings size={20} style={{ color: '#00b4d8' }} />
          </div>
          <div>
            <h2 id="wizard-title" className="text-lg font-bold text-zinc-100">
              Configuração Inicial
            </h2>
            <p className="text-[13px] text-zinc-500">Configure sua plataforma antes de começar</p>
          </div>
        </div>

        {/* Step indicators — glass bars */}
        <div className="flex gap-1.5 px-6 pt-5" role="list" aria-label="Etapas do wizard">
          {WIZARD_STEPS.map((s, i) => (
            <div
              key={s.id}
              role="listitem"
              aria-current={i === currentStep ? 'step' : undefined}
              className="flex-1 rounded-full transition-all duration-300"
              style={{
                height: 4,
                background:
                  i < currentStep
                    ? '#00b4d8'
                    : i === currentStep
                      ? 'rgba(0,180,216,0.5)'
                      : 'rgba(255,255,255,0.06)',
                boxShadow: i <= currentStep ? '0 0 8px rgba(0,180,216,0.15)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="p-6 min-h-[280px]">
          <div className="mb-5">
            <h3 className="text-[15px] font-semibold text-zinc-100">{step.title}</h3>
            <p className="text-[13px] text-zinc-500">{step.description}</p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div
              id="wizard-errors"
              role="alert"
              className="mb-4 p-3 rounded-lg"
              style={{
                background: 'rgba(251,113,133,0.08)',
                border: '1px solid rgba(251,113,133,0.15)',
              }}
            >
              {errors.map((e, i) => (
                <p key={i} className="text-[13px]" style={{ color: '#fb7185' }}>
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
                  className="block text-[13px] font-medium text-zinc-400 mb-1.5"
                >
                  Nome da Plataforma *
                </label>
                <input
                  id="app-name"
                  type="text"
                  value={data.appName}
                  onChange={e => update({ appName: e.target.value })}
                  aria-required="true"
                  aria-describedby={errors.length > 0 ? 'wizard-errors' : undefined}
                  className="w-full h-10 px-3 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-150"
                  style={inputBaseStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Minha Plataforma"
                />
              </div>
              <div>
                <label
                  htmlFor="logo-url"
                  className="block text-[13px] font-medium text-zinc-400 mb-1.5"
                >
                  URL do Logo (opcional)
                </label>
                <input
                  id="logo-url"
                  type="url"
                  value={data.logoUrl}
                  onChange={e => update({ logoUrl: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-150"
                  style={inputBaseStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>
            </div>
          )}

          {/* Step: Colors */}
          {step.id === 'colors' && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="primary-color"
                    className="block text-[13px] font-medium text-zinc-400 mb-1.5"
                  >
                    Cor Primária
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="primary-color"
                      type="color"
                      value={data.primaryColor}
                      onChange={e => update({ primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    />
                    <input
                      type="text"
                      value={data.primaryColor}
                      onChange={e => update({ primaryColor: e.target.value })}
                      className="flex-1 h-10 px-3 rounded-lg text-sm text-zinc-100 font-mono outline-none transition-all duration-150"
                      style={inputBaseStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="secondary-color"
                    className="block text-[13px] font-medium text-zinc-400 mb-1.5"
                  >
                    Cor Secundária
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="secondary-color"
                      type="color"
                      value={data.secondaryColor}
                      onChange={e => update({ secondaryColor: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    />
                    <input
                      type="text"
                      value={data.secondaryColor}
                      onChange={e => update({ secondaryColor: e.target.value })}
                      className="flex-1 h-10 px-3 rounded-lg text-sm text-zinc-100 font-mono outline-none transition-all duration-150"
                      style={inputBaseStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                  </div>
                </div>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeftWidth: 3,
                  borderLeftColor: data.primaryColor,
                }}
              >
                <p className="text-sm font-medium" style={{ color: data.primaryColor }}>
                  Prévia: {data.appName}
                </p>
                <p className="text-[12px] text-zinc-600 mt-1">
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
                  className="block text-[13px] font-medium text-zinc-400 mb-1.5"
                >
                  Nome Completo *
                </label>
                <input
                  id="admin-name"
                  type="text"
                  value={data.adminName}
                  onChange={e => update({ adminName: e.target.value })}
                  aria-required="true"
                  aria-describedby={errors.length > 0 ? 'wizard-errors' : undefined}
                  className="w-full h-10 px-3 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-150"
                  style={inputBaseStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="João Silva"
                />
              </div>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-[13px] font-medium text-zinc-400 mb-1.5"
                >
                  Email *
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={data.adminEmail}
                  onChange={e => update({ adminEmail: e.target.value })}
                  aria-required="true"
                  aria-describedby={errors.length > 0 ? 'wizard-errors' : undefined}
                  className="w-full h-10 px-3 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-150"
                  style={inputBaseStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="admin@empresa.com"
                />
              </div>
            </div>
          )}

          {/* Step: Modules — responsive grid with glass toggles */}
          {step.id === 'modules' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map(mod => {
                const enabled = data.enabledModules.includes(mod.id)
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModule(mod.id)}
                    aria-pressed={enabled}
                    className="p-4 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: enabled ? 'rgba(0,180,216,0.08)' : 'rgba(255,255,255,0.02)',
                      border: enabled
                        ? '1px solid rgba(0,180,216,0.3)'
                        : '1px solid rgba(255,255,255,0.06)',
                      boxShadow: enabled ? '0 0 12px rgba(0,180,216,0.08)' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-zinc-200">{mod.label}</p>
                      {/* Toggle indicator */}
                      <div
                        className="rounded-full transition-colors duration-200"
                        style={{
                          width: 32,
                          height: 18,
                          background: enabled ? '#00b4d8' : 'rgba(63,63,70,1)',
                          boxShadow: enabled ? '0 0 8px rgba(0,180,216,0.3)' : 'none',
                          position: 'relative',
                        }}
                      >
                        <div
                          className="absolute top-[2px] rounded-full bg-white shadow-sm transition-transform duration-200"
                          style={{
                            width: 14,
                            height: 14,
                            left: 2,
                            transform: enabled ? 'translateX(14px)' : 'translateX(0)',
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-[12px] text-zinc-500">{mod.description}</p>
                  </button>
                )
              })}
            </div>
          )}

          {/* Step: Summary */}
          {step.id === 'summary' && (
            <div className="space-y-3">
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Palette size={16} style={{ color: '#00b4d8', flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-medium text-zinc-200">{data.appName}</p>
                  <p className="text-[12px] text-zinc-600 font-mono">
                    {data.primaryColor} / {data.secondaryColor}
                  </p>
                </div>
              </div>
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <User size={16} style={{ color: '#00b4d8', flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-medium text-zinc-200">{data.adminName}</p>
                  <p className="text-[12px] text-zinc-600">{data.adminEmail}</p>
                </div>
              </div>
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <LayoutGrid size={16} style={{ color: '#00b4d8', flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {data.enabledModules.length} módulo(s) habilitado(s)
                  </p>
                  <p className="text-[12px] text-zinc-600">{data.enabledModules.join(', ')}</p>
                </div>
              </div>
              <div
                className="flex items-center gap-2 p-3 rounded-lg"
                style={{
                  background: 'rgba(52,211,153,0.06)',
                  border: '1px solid rgba(52,211,153,0.15)',
                }}
              >
                <CheckCircle size={16} style={{ color: '#34d399' }} />
                <p className="text-[13px]" style={{ color: '#34d399' }}>
                  Tudo pronto! Clique em &ldquo;Iniciar Plataforma&rdquo; para continuar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-zinc-400 rounded-lg transition-colors duration-150"
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <ChevronLeft size={16} />
                Voltar
              </button>
            )}
            {onSkip && isFirst && (
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2 text-sm font-medium text-zinc-600 transition-colors duration-150"
                onMouseEnter={e => (e.currentTarget.style.color = '#a1a1aa')}
                onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}
              >
                Pular por agora
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 px-6 py-2 text-sm font-medium text-white rounded-lg transition-opacity duration-150"
            style={{ background: '#00b4d8' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {isLast ? 'Iniciar Plataforma' : 'Próximo'}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FirstRunWizard
