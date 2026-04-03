import type { WizardData } from '../FirstRunWizard'

const inputBaseStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
}

function handleInputFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = '#00b4d8'
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.15)'
}

function handleInputBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
  e.currentTarget.style.boxShadow = 'none'
}

export interface WizardStepBrandingProps {
  data: WizardData
  errors: string[]
  onUpdate: (partial: Partial<WizardData>) => void
}

export function WizardStepBranding({ data, errors, onUpdate }: WizardStepBrandingProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="app-name" className="block text-[13px] font-medium text-zinc-400 mb-1.5">
          Nome da Plataforma *
        </label>
        <input
          id="app-name"
          type="text"
          value={data.appName}
          onChange={e => onUpdate({ appName: e.target.value })}
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
        <label htmlFor="logo-url" className="block text-[13px] font-medium text-zinc-400 mb-1.5">
          URL do Logo (opcional)
        </label>
        <input
          id="logo-url"
          type="url"
          value={data.logoUrl}
          onChange={e => onUpdate({ logoUrl: e.target.value })}
          className="w-full h-10 px-3 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-150"
          style={inputBaseStyle}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="https://exemplo.com/logo.png"
        />
      </div>
    </div>
  )
}
