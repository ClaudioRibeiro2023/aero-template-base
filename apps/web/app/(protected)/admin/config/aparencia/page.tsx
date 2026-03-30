'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

export default function ConfigAparenciaPage() {
  const [primaryColor, setPrimaryColor] = useState('#0087a8')
  const [secondaryColor, setSecondaryColor] = useState('#005f73')
  const [logoUrl, setLogoUrl] = useState('')
  const { toast } = useToast()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    // Em produção: salvar em admin_config.branding no Supabase
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
          <h1 className="text-xl font-bold">Aparência</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Tema, cores e branding da plataforma
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-6"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium mb-1.5">
              Cor Primária
            </label>
            <div className="flex items-center gap-2">
              <input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-10 h-9 rounded cursor-pointer border border-[var(--border-default)]"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label htmlFor="secondaryColor" className="block text-sm font-medium mb-1.5">
              Cor Secundária
            </label>
            <div className="flex items-center gap-2">
              <input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={e => setSecondaryColor(e.target.value)}
                className="w-10 h-9 rounded cursor-pointer border border-[var(--border-default)]"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={e => setSecondaryColor(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium mb-1.5">
            URL do Logo
          </label>
          <input
            id="logoUrl"
            type="url"
            value={logoUrl}
            onChange={e => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            SVG ou PNG recomendado. Deixe vazio para usar inicial do nome
          </p>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-[var(--border-default)] p-3 bg-[var(--surface-base)]">
          <p className="text-xs text-[var(--text-muted)] mb-2">Preview</p>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              T
            </div>
            <span className="text-sm font-semibold">Template Platform</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
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
