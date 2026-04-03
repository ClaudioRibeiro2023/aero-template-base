'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { useToast } from '@template/design-system'
import { useFormDirty } from '@/hooks/useFormDirty'
import { useAdminPlatformConfig } from '@/hooks/usePlatformConfig'
import type { PartialPlatformConfig } from '@/services/adminConfig'

export default function ConfigGeralPage() {
  const { config, updateAsync } = useAdminPlatformConfig()
  const [appName, setAppName] = useState('')
  const [language, setLanguage] = useState('pt-BR')
  const { success, error: toastError } = useToast()
  const { isDirty, markDirty, markClean } = useFormDirty()

  // Sync form state quando config carrega
  useEffect(() => {
    if (config) {
      setAppName(config.branding.appName || process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform')
      setLanguage(config.defaultLanguage || 'pt-BR')
    }
  }, [config])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateAsync({
        branding: { appName },
        defaultLanguage: language,
      } as PartialPlatformConfig)
      markClean()
      success('Configurações salvas com sucesso')
    } catch {
      toastError('Erro ao salvar configurações')
    }
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
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Configurações Gerais</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Nome do sistema e preferências básicas
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="relative z-10 glass-panel p-6 space-y-5">
        <div>
          <label
            htmlFor="appName"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
          >
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
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm text-[var(--text-primary)] transition-all duration-200 focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/20"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            Exibido no header, login e emails
          </p>
        </div>

        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
          >
            Idioma Padrão
          </label>
          <select
            id="language"
            value={language}
            onChange={e => {
              setLanguage(e.target.value)
              markDirty()
            }}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm text-[var(--text-primary)] transition-all duration-200 focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/20"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es">Espanhol</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {isDirty && (
            <span className="text-xs text-amber-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Alterações não salvas
            </span>
          )}
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
