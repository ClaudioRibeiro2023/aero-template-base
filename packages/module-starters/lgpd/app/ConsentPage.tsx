import { useState } from 'react'
import { CheckSquare, Save, Info, ToggleLeft, ToggleRight } from 'lucide-react'
import { PageHeader } from '@template/design-system'

interface ConsentItem {
  id: string
  title: string
  description: string
  required: boolean
  enabled: boolean
}

const INITIAL_CONSENTS: ConsentItem[] = [
  {
    id: 'essential',
    title: 'Dados Essenciais',
    description: 'Necessários para o funcionamento básico do sistema (autenticação, segurança)',
    required: true,
    enabled: true,
  },
  {
    id: 'analytics',
    title: 'Análise de Uso',
    description: 'Coleta de dados anônimos para melhoria do sistema',
    required: false,
    enabled: true,
  },
  {
    id: 'marketing',
    title: 'Comunicações de Marketing',
    description: 'Receber novidades, atualizações e ofertas por email',
    required: false,
    enabled: false,
  },
  {
    id: 'thirdparty',
    title: 'Compartilhamento com Terceiros',
    description: 'Compartilhar dados com parceiros para serviços complementares',
    required: false,
    enabled: false,
  },
  {
    id: 'profiling',
    title: 'Personalização',
    description: 'Usar dados para personalizar sua experiência no sistema',
    required: false,
    enabled: true,
  },
]

export default function ConsentPage() {
  const [consents, setConsents] = useState(INITIAL_CONSENTS)
  const [saved, setSaved] = useState(false)

  const toggleConsent = (id: string) => {
    setConsents(prev =>
      prev.map(c => (c.id === id && !c.required ? { ...c, enabled: !c.enabled } : c))
    )
    setSaved(false)
  }

  const handleSave = () => {
    // API call to save consents
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border-default">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PageHeader
            title="Gerenciar Consentimento"
            description="Controle como seus dados são utilizados"
            icon={<CheckSquare size={28} />}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 status-card status-card--info rounded-lg mb-6">
          <Info size={20} className="text-blue-500 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Você pode alterar suas preferências a qualquer momento. Algumas opções são obrigatórias
            para o funcionamento do sistema.
          </p>
        </div>

        {/* Consent Items */}
        <div className="space-y-4">
          {consents.map(consent => (
            <div
              key={consent.id}
              className="bg-surface-elevated rounded-lg border border-border-default p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-text-primary">{consent.title}</h3>
                    {consent.required && (
                      <span className="px-2 py-0.5 bg-surface-muted text-text-muted text-xs rounded">
                        Obrigatório
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">{consent.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleConsent(consent.id)}
                  disabled={consent.required}
                  className={`flex-shrink-0 ${consent.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  aria-label={consent.enabled ? 'Desativar' : 'Ativar'}
                >
                  {consent.enabled ? (
                    <ToggleRight size={36} className="text-green-500" />
                  ) : (
                    <ToggleLeft size={36} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-text-muted">Alterações serão aplicadas imediatamente</p>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Save size={18} />
            {saved ? 'Salvo!' : 'Salvar Preferências'}
          </button>
        </div>

        {/* History */}
        <div className="mt-12 pt-8 border-t border-border-default">
          <h2 className="text-lg font-medium text-text-primary mb-4">Histórico de Consentimento</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-3 bg-surface-muted rounded">
              <span className="text-text-secondary">Consentimento inicial aceito</span>
              <span className="text-text-muted">15/01/2024 10:30</span>
            </div>
            <div className="flex justify-between p-3 bg-surface-muted rounded">
              <span className="text-text-secondary">Marketing desativado</span>
              <span className="text-text-muted">20/02/2024 14:15</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
