'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <label className="flex items-center justify-between py-3 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${checked ? 'bg-[var(--brand-primary)]' : 'bg-[var(--border-default)]'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </label>
  )
}

export default function ConfigNotificacoesPage() {
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [alertsEnabled, setAlertsEnabled] = useState(true)
  const { toast } = useToast()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    toast('Configurações salvas com sucesso')
  }

  return (
    <main className="page-enter max-w-2xl mx-auto p-4 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/config"
          className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Notificações</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Email, push e configuração de alertas
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] divide-y divide-[var(--border-default)]"
      >
        <div className="px-6 py-2">
          <Toggle
            checked={emailEnabled}
            onChange={() => setEmailEnabled(!emailEnabled)}
            label="Notificações por Email"
          />
          <Toggle
            checked={pushEnabled}
            onChange={() => setPushEnabled(!pushEnabled)}
            label="Notificações Push"
          />
          <Toggle
            checked={alertsEnabled}
            onChange={() => setAlertsEnabled(!alertsEnabled)}
            label="Alertas do Sistema"
          />
        </div>
        <div className="px-6 py-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90"
          >
            <Save size={15} />
            Salvar
          </button>
        </div>
      </form>
    </main>
  )
}
