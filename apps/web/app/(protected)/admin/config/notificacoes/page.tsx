'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { useToast } from '@template/design-system'

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: () => void
  label: string
  description?: string
}) {
  return (
    <label className="flex items-center justify-between py-3.5 cursor-pointer group">
      <div>
        <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
        {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 rounded-full transition-all duration-200 ${
          checked ? 'bg-[var(--brand-primary)]' : 'bg-[var(--bg-muted)]'
        }`}
        style={checked ? { boxShadow: '0 0 12px var(--glow-brand)' } : undefined}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

export default function ConfigNotificacoesPage() {
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const { success } = useToast()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    success('Configuracoes salvas com sucesso')
  }

  return (
    <main className="page-enter ambient-gradient max-w-2xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Link
          href="/admin/config"
          className="p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Notificacoes</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Email, push e configuracao de alertas
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="relative z-10 glass-panel divide-y divide-[var(--glass-border)]"
      >
        <div className="px-6 py-2">
          <Toggle
            checked={emailEnabled}
            onChange={() => setEmailEnabled(!emailEnabled)}
            label="Notificacoes por Email"
            description="Receber alertas e atualizacoes por email"
          />
          <Toggle
            checked={pushEnabled}
            onChange={() => setPushEnabled(!pushEnabled)}
            label="Notificacoes Push"
            description="Notificacoes no navegador em tempo real"
          />
          <Toggle
            checked={alertsEnabled}
            onChange={() => setAlertsEnabled(!alertsEnabled)}
            label="Alertas do Sistema"
            description="Alertas criticos e de seguranca"
          />
        </div>
        <div className="px-6 py-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            style={{ boxShadow: '0 0 16px var(--glow-brand)' }}
          >
            <Save size={15} />
            Salvar
          </button>
        </div>
      </form>
    </main>
  )
}
