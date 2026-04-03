import type { Metadata } from 'next'
import Link from 'next/link'
import { BarChart3, TrendingUp, Users, Activity, ChevronLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Analytics' }

const METRICS = [
  { label: 'Pageviews hoje', value: '1.248', change: '+8%', up: true, icon: BarChart3 },
  { label: 'Usuários únicos', value: '312', change: '+3%', up: true, icon: Users },
  { label: 'Taxa de retenção', value: '74%', change: '-1%', up: false, icon: TrendingUp },
  { label: 'Sessões ativas', value: '47', change: '+12%', up: true, icon: Activity },
]

export default function AnalyticsPage() {
  return (
    <main className="page-enter ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="relative z-10 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          aria-label="Voltar ao dashboard"
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Métricas de uso da plataforma
          </p>
        </div>
      </div>

      <section aria-label="Métricas principais" className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {METRICS.map(m => {
            const Icon = m.icon
            return (
              <div key={m.label} className="glass-panel p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-[var(--brand-primary)]/10">
                    <Icon size={18} className="text-[var(--brand-primary)]" aria-hidden="true" />
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      m.up ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {m.change}
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">{m.value}</p>
                <p className="text-sm text-[var(--text-muted)]">{m.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      <div className="relative z-10 glass-panel p-6">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Atividade dos últimos 30 dias
        </h2>
        <div className="flex items-end gap-1.5 h-32">
          {Array.from({ length: 30 }, (_, i) => {
            const h = 20 + Math.abs(Math.sin(i * 0.7) * 70)
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${h}%`,
                  background:
                    'linear-gradient(to top, var(--brand-primary), var(--brand-secondary))',
                  opacity: 0.6 + (i / 30) * 0.4,
                }}
                aria-hidden="true"
              />
            )
          })}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3 text-center">
          Dados ilustrativos — integração com analytics real em breve
        </p>
      </div>
    </main>
  )
}
