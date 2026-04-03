import { Palette, User, LayoutGrid, CheckCircle } from 'lucide-react'
import type { WizardData } from '../FirstRunWizard'

export interface WizardStepSummaryProps {
  data: WizardData
}

export function WizardStepSummary({ data }: WizardStepSummaryProps) {
  return (
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
  )
}
