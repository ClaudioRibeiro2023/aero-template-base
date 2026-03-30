'use client'

import { BarChart3, Plus } from 'lucide-react'

export default function RelatoriosPage() {
  return (
    <main className="page-enter">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{'Relat\u00f3rios'}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {'An\u00e1lises e relat\u00f3rios do sistema'}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed border-[var(--border-default)]">
        <BarChart3 className="w-12 h-12 text-[var(--text-muted)] mb-4" />
        <h2 className="text-lg font-semibold text-[var(--text-secondary)] mb-2">
          {'Nenhum relat\u00f3rio ainda'}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 text-center max-w-md">
          {
            'Os relat\u00f3rios aparecer\u00e3o aqui conforme o sistema for utilizado. Comece criando seu primeiro relat\u00f3rio.'
          }
        </p>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          {'Criar Relat\u00f3rio'}
        </button>
      </div>
    </main>
  )
}
