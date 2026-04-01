'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { useToast } from '@template/design-system'
import { NavigationEditor, type NavItem } from '@/components/admin/NavigationEditor'
import { useNavigationConfig } from '@/hooks/useNavigationConfig'

// Converte ModuleConfig → NavItem para o editor visual
function toNavItems(
  modules: { id: string; name: string; path: string; enabled: boolean; order: number }[]
): NavItem[] {
  return modules.map(m => ({
    id: m.id,
    label: m.name,
    path: m.path,
    enabled: m.enabled,
    order: m.order,
  }))
}

export default function ConfigNavegacaoPage() {
  const { config, refresh } = useNavigationConfig()
  const [items, setItems] = useState<NavItem[]>(() => toNavItems(config.modules))
  const [saving, setSaving] = useState(false)
  const { success, error: toastError } = useToast()

  // Sync quando config carrega da API/cache
  const handleReorder = useCallback((reordered: NavItem[]) => {
    setItems(reordered)
  }, [])

  const handleToggle = useCallback((itemId: string) => {
    setItems(prev => prev.map(it => (it.id === itemId ? { ...it, enabled: !it.enabled } : it)))
  }, [])

  const handleAdd = useCallback((item: Omit<NavItem, 'order'>) => {
    setItems(prev => [...prev, { ...item, order: prev.length }])
  }, [])

  const handleRemove = useCallback((itemId: string) => {
    setItems(prev => prev.filter(it => it.id !== itemId).map((it, idx) => ({ ...it, order: idx })))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/config/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ navigation: items }),
      })
      const json = (await res.json()) as { error?: { message?: string } }
      if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`)
      await refresh()
      success('Navegacao salva com sucesso')
    } catch {
      toastError('Erro ao salvar navegacao')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page-enter ambient-gradient max-w-3xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Link
          href="/admin/config"
          className="p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Navegacao</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Configure menus, ordem e visibilidade
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="relative z-10 space-y-4">
        <div className="glass-panel p-6">
          <NavigationEditor
            items={items}
            onReorder={handleReorder}
            onToggle={handleToggle}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 0 16px var(--glow-brand)' }}
          >
            <Save size={15} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </main>
  )
}
