'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface Webhook {
  id: string
  url: string
  events: string
}

export default function ConfigIntegracoesPage() {
  const [apiKey] = useState('sk-template-••••••••••••••••')
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    { id: '1', url: 'https://example.com/webhook', events: 'user.created, user.updated' },
  ])
  const { toast } = useToast()

  function addWebhook() {
    setWebhooks(prev => [...prev, { id: Date.now().toString(), url: '', events: '' }])
  }

  function removeWebhook(id: string) {
    setWebhooks(prev => prev.filter(w => w.id !== id))
  }

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
          <h1 className="text-xl font-bold">Integrações</h1>
          <p className="text-sm text-[var(--text-secondary)]">APIs, webhooks e serviços externos</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* API Key */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 space-y-3">
          <h2 className="text-sm font-semibold">Chave de API</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={apiKey}
              readOnly
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm font-mono text-[var(--text-muted)]"
            />
            <button
              type="button"
              className="px-3 py-2 rounded-lg border border-[var(--border-default)] text-sm hover:bg-[var(--surface-base)] transition-colors"
            >
              Copiar
            </button>
          </div>
        </div>

        {/* Webhooks */}
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Webhooks</h2>
            <button
              type="button"
              onClick={addWebhook}
              className="flex items-center gap-1.5 text-xs text-[var(--brand-primary)] hover:underline"
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
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm"
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
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeWebhook(wh.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--text-muted)] hover:text-red-500 transition-colors"
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
