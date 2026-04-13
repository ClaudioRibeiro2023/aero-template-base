'use client'

import { Construction, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ComingSoonProps {
  title?: string
  description?: string
  backHref?: string
  backLabel?: string
}

/**
 * Stub page for navigation routes that are defined in the sidebar
 * but not yet implemented. Prevents 404 errors and shows a branded
 * "coming soon" state instead.
 */
export function ComingSoon({
  title = 'Em Construção',
  description = 'Esta funcionalidade está sendo desenvolvida e estará disponível em breve.',
  backHref = '/dashboard',
  backLabel = 'Voltar ao Dashboard',
}: ComingSoonProps) {
  return (
    <main className="page-enter ambient-gradient max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="relative z-10 glass-panel flex flex-col items-center justify-center py-20 px-6">
        {/* Decorative glow */}
        <div
          className="absolute inset-0 rounded-[var(--radius-lg)] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 40%, var(--glow-brand), transparent)',
            opacity: 0.1,
          }}
        />

        <div className="relative p-4 rounded-2xl bg-amber-500/10 mb-5">
          <Construction className="w-10 h-10 text-amber-400" aria-hidden="true" />
        </div>

        <h1 className="relative text-xl font-semibold text-[var(--text-primary)] mb-2">{title}</h1>
        <p className="relative text-sm text-[var(--text-muted)] mb-8 text-center max-w-md leading-relaxed">
          {description}
        </p>

        <Link
          href={backHref}
          className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white font-medium text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          style={{ boxShadow: '0 0 20px var(--glow-brand)' }}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {backLabel}
        </Link>
      </div>
    </main>
  )
}
