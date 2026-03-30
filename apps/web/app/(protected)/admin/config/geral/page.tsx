'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { useFormDirty } from '@/hooks/useFormDirty'

export default function ConfigGeralPage() {
  const [appName, setAppName] = useState(process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform')
  const [language, setLanguage] = useState('pt-BR')
  const { toast } = useToast()
  const { isDirty, markDirty, markClean } = useFormDirty()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    // Em produção: salvar em admin_config no Supabase
    markClean()
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
          <h1 className="text-xl font-bold">Configurações Gerais</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Nome do sistema e preferências básicas
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-6"
      >
        <div>
          <label htmlFor="appName" className="block text-sm font-medium mb-1.5">
            Nome do Sistema
          </label>
          <input
            id="appName"
            type="text"
            value={appName}
            onChange={e => {
              setAppName(e.target.value)
              markDirty()
            }}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">Exibido no header, login e emails</p>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-1.5">
            Idioma Padrão
          </label>
          <select
            id="language"
            value={language}
            onChange={e => {
              setLanguage(e.target.value)
              markDirty()
            }}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es">Español</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {isDirty && (
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Alterações não salvas
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Save size={15} />
            Salvar
          </button>
        </div>
      </form>
    </main>
  )
}
