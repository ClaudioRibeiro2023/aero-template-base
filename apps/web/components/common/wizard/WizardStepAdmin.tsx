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

export interface WizardStepAdminProps {
  data: WizardData
  errors: string[]
  onUpdate: (partial: Partial<WizardData>) => void
}

export function WizardStepAdmin({ data, errors, onUpdate }: WizardStepAdminProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="admin-name" className="block text-[13px] font-medium text-zinc-400 mb-1.5">
          Nome Completo *
        </label>
        <input
          id="admin-name"
          type="text"
          value={data.adminName}
          onChange={e => onUpdate({ adminName: e.target.value })}
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
        <label htmlFor="admin-email" className="block text-[13px] font-medium text-zinc-400 mb-1.5">
          Email *
        </label>
        <input
          id="admin-email"
          type="email"
          value={data.adminEmail}
          onChange={e => onUpdate({ adminEmail: e.target.value })}
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
  )
}
