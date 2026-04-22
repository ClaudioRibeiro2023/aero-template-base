'use client'

/**
 * Página principal do módulo template.
 * Substitua pelo conteúdo real do seu módulo.
 */
import { Box } from 'lucide-react'

export default function TemplatePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
          <Box className="text-brand-primary" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Meu Módulo</h1>
          <p className="text-text-secondary text-sm">Substitua este conteúdo pelo seu módulo</p>
        </div>
      </div>

      <div className="bg-surface-elevated rounded-xl p-6 border border-border-default">
        <p className="text-text-secondary">Conteúdo do módulo aqui.</p>
      </div>
    </div>
  )
}
