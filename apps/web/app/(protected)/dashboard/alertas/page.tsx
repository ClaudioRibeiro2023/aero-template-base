import type { Metadata } from 'next'
import Link from 'next/link'
import { Bell, ChevronLeft, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = { title: 'Alertas' }

type AlertLevel = 'info' | 'warning' | 'success' | 'error'

const ALERTS: { level: AlertLevel; title: string; description: string; time: string }[] = [
  {
    level: 'info',
    title: 'Atualização de sistema disponível',
    description: 'Uma nova versão da plataforma está disponível. Atualize para obter melhorias.',
    time: 'Há 2h',
  },
  {
    level: 'warning',
    title: 'Limite de armazenamento próximo',
    description: 'O uso de armazenamento está em 85% da capacidade contratada.',
    time: 'Há 4h',
  },
  {
    level: 'success',
    title: 'Backup concluído com sucesso',
    description: 'O backup automático dos dados foi realizado sem erros.',
    time: 'Há 6h',
  },
  {
    level: 'error',
    title: 'Falha na integração de webhook',
    description: 'O endpoint configurado retornou erro 503. Verifique a integração.',
    time: 'Há 8h',
  },
]

const LEVEL_CONFIG: Record<AlertLevel, { icon: React.ElementType; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  error: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
}

export default async function AlertasPage() {
  const t = await getTranslations('alerts')
  const tc = await getTranslations('common')

  return (
    <main className="page-enter ambient-gradient max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="relative z-10 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          aria-label={tc('back')}
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('subtitle')}</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--brand-primary)]/10">
          <Bell size={14} className="text-[var(--brand-primary)]" aria-hidden="true" />
          <span className="text-xs font-medium text-[var(--brand-primary)]">
            {t('count', { count: ALERTS.length })}
          </span>
        </div>
      </div>

      <div className="relative z-10 space-y-3">
        {ALERTS.map((alert, i) => {
          const { icon: Icon, color, bg } = LEVEL_CONFIG[alert.level]
          return (
            <div key={i} className="glass-panel p-4 flex items-start gap-4">
              <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0 mt-0.5`}>
                <Icon size={18} className={color} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{alert.title}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{alert.description}</p>
              </div>
              <span className="text-xs text-[var(--text-muted)] flex-shrink-0 mt-0.5">
                {alert.time}
              </span>
            </div>
          )
        })}
      </div>
    </main>
  )
}
