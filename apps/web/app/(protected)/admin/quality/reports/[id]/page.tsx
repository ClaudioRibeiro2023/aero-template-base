'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useTranslations, useFormatter } from 'next-intl'
import { useQualityReport } from '@/hooks/useQualityDiagnostic'
import { QualityOverallScore } from '@/components/quality/QualityOverallScore'
import { QualityCategoryDetail } from '@/components/quality/QualityCategoryDetail'

export default function QualityReportPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('quality')
  const tc = useTranslations('common')
  const format = useFormatter()
  const { id } = use(params)
  const { data: report, isLoading, isError } = useQualityReport(id)

  if (isLoading) {
    return (
      <main className="ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 flex justify-center py-16">
        <Loader2 size={24} className="animate-spin text-[var(--brand-primary)]" />
      </main>
    )
  }

  if (isError || !report) {
    return (
      <main className="ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div role="alert" className="glass-panel p-6 text-center text-sm text-rose-400">
          {t('reportNotFound')}
        </div>
      </main>
    )
  }

  const categories = Object.values(report.results)

  return (
    <main className="page-enter ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="relative z-10">
        <Link
          href="/admin/quality"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-4"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {tc('back')}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('reportTitle')}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          {t('generatedAt')}{' '}
          {format.dateTime(new Date(report.created_at), {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </div>

      <div className="relative z-10 flex justify-center">
        <QualityOverallScore score={report.overall_score} />
      </div>

      <div className="relative z-10 space-y-2">
        {categories.map(cat => (
          <QualityCategoryDetail key={cat.category} result={cat} />
        ))}
      </div>
    </main>
  )
}
