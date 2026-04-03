import { AVAILABLE_MODULES } from '../FirstRunWizard'
import type { WizardData } from '../FirstRunWizard'

export interface WizardStepModulesProps {
  data: WizardData
  onToggleModule: (moduleId: string) => void
}

export function WizardStepModules({ data, onToggleModule }: WizardStepModulesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {AVAILABLE_MODULES.map(mod => {
        const enabled = data.enabledModules.includes(mod.id)
        return (
          <button
            key={mod.id}
            type="button"
            onClick={() => onToggleModule(mod.id)}
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
  )
}
