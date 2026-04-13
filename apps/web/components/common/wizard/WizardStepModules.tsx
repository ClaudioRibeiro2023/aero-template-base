import { AVAILABLE_MODULES } from '../FirstRunWizard'
import type { WizardData } from '../FirstRunWizard'

export interface WizardStepModulesProps {
  data: WizardData
  onToggleModule: (moduleId: string) => void
}

export function WizardStepModules({ data, onToggleModule }: WizardStepModulesProps) {
  const defaultModules = AVAILABLE_MODULES.filter(m => m.isDefault)
  const optionalModules = AVAILABLE_MODULES.filter(m => !m.isDefault)

  return (
    <div className="space-y-5">
      {/* Core modules info */}
      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
        <p className="text-xs text-emerald-400 font-medium mb-1">Modulos Core (sempre ativos)</p>
        <p className="text-[11px] text-zinc-500">
          Autenticacao, Administracao, Configuracoes e Busca Global estao sempre habilitados.
        </p>
      </div>

      {/* Default modules */}
      {defaultModules.length > 0 && (
        <div>
          <p className="text-xs text-zinc-400 font-medium mb-2">Recomendados</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {defaultModules.map(mod => {
              const enabled = data.enabledModules.includes(mod.id)
              return (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  enabled={enabled}
                  onToggle={() => onToggleModule(mod.id)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Optional modules */}
      {optionalModules.length > 0 && (
        <div>
          <p className="text-xs text-zinc-400 font-medium mb-2">Opcionais</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {optionalModules.map(mod => {
              const enabled = data.enabledModules.includes(mod.id)
              return (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  enabled={enabled}
                  onToggle={() => onToggleModule(mod.id)}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ModuleCard({
  mod,
  enabled,
  onToggle,
}: {
  mod: { id: string; label: string; description: string; isDefault: boolean }
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      className="p-4 rounded-xl text-left transition-all duration-200"
      style={{
        background: enabled ? 'rgba(0,180,216,0.08)' : 'rgba(255,255,255,0.02)',
        border: enabled ? '1px solid rgba(0,180,216,0.3)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: enabled ? '0 0 12px rgba(0,180,216,0.08)' : 'none',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-zinc-200">{mod.label}</p>
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
}
