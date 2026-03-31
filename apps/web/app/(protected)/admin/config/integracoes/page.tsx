'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save, Plus, Trash2, Key, Webhook } from 'lucide-react'
import { useToast } from '@template/design-system'

interface WebhookItem {
  id: string
  url: string
  events: string
}

export default function ConfigIntegracoesPage() {
  const [apiKey] = useState('sk-template-••••••••••••••••')
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([
    { id: '1', url: 'https://example.com/webhook', events: 'user.created, user.updated' },
  ])
  const { success } = useToast()

  function addWebhook() {
    setWebhooks(prev => [...prev, { id: Date.now().toString(), url: '', events: '' }])
  }

  function removeWebhook(id: string) {
    setWebhooks(prev => prev.filter(w => w.id !== id))
  }

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
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Integracoes</h1>
          <p className="text-sm text-[var(--text-secondary)]">APIs, webhooks e servicos externos</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="relative z-10 space-y-4">
        {/* API Key */}
        <div className="glass-panel p-6 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Key size={16} className="text-[var(--brand-primary)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Chave de API</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={apiKey}
              readOnly
              className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm font-mono text-[var(--text-muted)]"
            />
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl border border-[var(--glass-border)] text-sm text-[var(--text-secondary)] hover:bg-white/[0.03] hover:border-[var(--glass-border-hover)] transition-all"
            >
              Copiar
            </button>
          </div>
        </div>

        {/* Webhooks */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook size={16} className="text-[var(--accent-purple)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Webhooks</h2>
            </div>
            <button
              type="button"
              onClick={addWebhook}
              className="flex items-center gap-1.5 text-xs text-[var(--brand-primary)] hover:text-[var(--brand-primary)]/80 transition-colors"
            >
              <Plus size={13} /> Adicionar
            </button>
          </div>
          {webhooks.map(wh => (
            <div key={wh.id} className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={wh.url}
                  onChange={e =>
                    setWebhooks(prev =>
                      prev.map(w => (w.id === wh.id ? { ...w, url: e.target.value } : w))
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm text-[var(--text-primary)] transition-all duration-200 focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/20 placeholder:text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  placeholder="Eventos (ex: user.created)"
                  value={wh.events}
                  onChange={e =>
                    setWebhooks(prev =>
                      prev.map(w => (w.id === wh.id ? { ...w, events: e.target.value } : w))
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm text-[var(--text-primary)] transition-all duration-200 focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/20 placeholder:text-[var(--text-muted)]"
                />
              </div>
              <button
                type="button"
                onClick={() => removeWebhook(wh.id)}
                className="p-2 rounded-xl hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-400 transition-all"
                aria-label="Remover webhook"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
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
