import { Settings, ChevronRight, ChevronLeft } from 'lucide-react'
import { WIZARD_STEPS } from '../FirstRunWizard'

export interface WizardLayoutProps {
  currentStep: number
  isFirst: boolean
  isLast: boolean
  errors: string[]
  onNext: () => void
  onBack: () => void
  onSkip?: () => void
  children: React.ReactNode
  stepTitle: string
  stepDescription: string
}

export function WizardLayout({
  currentStep,
  isFirst,
  isLast,
  errors,
  onNext,
  onBack,
  onSkip,
  children,
  stepTitle,
  stepDescription,
}: WizardLayoutProps) {
  return (
    <>
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
          <h3 className="text-[15px] font-semibold text-zinc-100">{stepTitle}</h3>
          <p className="text-[13px] text-zinc-500">{stepDescription}</p>
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

        {children}
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
              onClick={onBack}
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
          onClick={onNext}
          className="flex items-center gap-1 px-6 py-2 text-sm font-medium text-white rounded-lg transition-opacity duration-150"
          style={{ background: '#00b4d8' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {isLast ? 'Iniciar Plataforma' : 'Próximo'}
          {!isLast && <ChevronRight size={16} />}
        </button>
      </div>
    </>
  )
}
