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

export interface WizardStepColorsProps {
  data: WizardData
  onUpdate: (partial: Partial<WizardData>) => void
}

export function WizardStepColors({ data, onUpdate }: WizardStepColorsProps) {
  return (
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
              onChange={e => onUpdate({ primaryColor: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            />
            <input
              type="text"
              value={data.primaryColor}
              onChange={e => onUpdate({ primaryColor: e.target.value })}
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
              onChange={e => onUpdate({ secondaryColor: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0.5"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            />
            <input
              type="text"
              value={data.secondaryColor}
              onChange={e => onUpdate({ secondaryColor: e.target.value })}
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
  )
}
