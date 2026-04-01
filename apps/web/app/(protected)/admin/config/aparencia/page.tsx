'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { useToast } from '@template/design-system'
import { useAdminPlatformConfig } from '@/hooks/usePlatformConfig'
import type { PartialPlatformConfig } from '@/services/adminConfig'

export default function ConfigAparenciaPage() {
  const { config, updateAsync } = useAdminPlatformConfig()
  const [primaryColor, setPrimaryColor] = useState('#00b4d8')
  const [secondaryColor, setSecondaryColor] = useState('#005f73')
  const [logoUrl, setLogoUrl] = useState('')
  const { success, error: toastError } = useToast()

  useEffect(() => {
    if (config) {
      if (config.branding.primaryColor) setPrimaryColor(config.branding.primaryColor)
      if (config.branding.secondaryColor) setSecondaryColor(config.branding.secondaryColor)
      if (config.branding.logoUrl) setLogoUrl(config.branding.logoUrl)
    }
  }, [config])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateAsync({
        branding: { primaryColor, secondaryColor, logoUrl: logoUrl || undefined },
      } as PartialPlatformConfig)
      success('Configuracoes salvas com sucesso')
    } catch {
      toastError('Erro ao salvar configuracoes')
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
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Aparencia</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Tema, cores e branding da plataforma
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="relative z-10 glass-panel p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="primaryColor"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Cor Primaria
            </label>
            <div className="flex items-center gap-2">
              <input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-[var(--glass-border)] bg-transparent"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm font-mono text-[var(--text-primary)] transition-all duration-200 focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/20"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="secondaryColor"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Cor Secundaria
            </label>
            <div className="flex items-center gap-2">
              <input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={e => setSecondaryColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-[var(--glass-border)] bg-transparent"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={e => setSecondaryColor(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm font-mono text-[var(--text-primary)] transition-all duration-200 focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/20"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="logoUrl"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
          >
            URL do Logo
          </label>
          <input
            id="logoUrl"
            type="url"
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm text-[var(--text-primary)] transition-all duration-200 focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/20 placeholder:text-[var(--text-muted)]"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            SVG ou PNG recomendado. Deixe vazio para usar inicial do nome
          </p>
        </div>

        {/* Preview */}
        <div className="glass-panel p-4">
          <p className="text-xs text-[var(--text-muted)] mb-3">Preview</p>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg"
              style={{ backgroundColor: primaryColor, boxShadow: `0 0 16px ${primaryColor}40` }}
            >
              T
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Template Platform
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
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
