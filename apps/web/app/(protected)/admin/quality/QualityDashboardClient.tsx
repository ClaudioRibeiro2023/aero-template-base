'use client'

import { useState, useCallback } from 'react'
import { Play, Loader2, History, Save } from 'lucide-react'
import { useTranslations, useFormatter } from 'next-intl'
import { runDiagnostic, type DiagnosticReport } from '@/lib/quality-checks'
import { useServerChecks, useRunDiagnostic, useQualityReports } from '@/hooks/useQualityDiagnostic'
import { QualityOverallScore } from '@/components/quality/QualityOverallScore'
import { QualityScoreCard } from '@/components/quality/QualityScoreCard'
import { QualityCategoryDetail } from '@/components/quality/QualityCategoryDetail'
import { DiagnosticRunner } from '@/components/quality/DiagnosticRunner'
import Link from 'next/link'

export function QualityDashboardClient() {
  const t = useTranslations('quality')
  const format = useFormatter()
  const [report, setReport] = useState<DiagnosticReport | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const { data: serverChecks } = useServerChecks()
  const saveDiagnostic = useRunDiagnostic()
  const { data: historyData } = useQualityReports()

  const history = historyData?.data ?? []

  const handleRun = useCallback(async () => {
    setIsRunning(true)
    try {
      const result = await runDiagnostic(serverChecks ?? undefined)
      setReport(result)
    } finally {
      setIsRunning(false)
    }
  }, [serverChecks])

  const handleSave = useCallback(() => {
    if (!report) return
    saveDiagnostic.mutate({
      overall_score: report.overall_score,
      results: report.results,
    })
  }, [report, saveDiagnostic])

  const categories = report ? Object.values(report.results) : []

  return (
    <main className="page-enter ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t('analyzing')}</p>
        </div>
        <div className="flex gap-2">
          {report && !saveDiagnostic.isSuccess && (
            <button
              onClick={handleSave}
              disabled={saveDiagnostic.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-[rgba(255,255,255,0.1)] text-[var(--text-secondary)] hover:bg-white/[0.03] transition-colors min-h-[44px]"
            >
              {saveDiagnostic.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {t('save')}
            </button>
          )}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {isRunning ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}
            {isRunning ? t('running') : t('runDiagnostic')}
          </button>
        </div>
      </div>

      {/* Runner */}
      {isRunning && (
        <div className="relative z-10">
          <DiagnosticRunner isRunning={isRunning} currentCategory={t('analyzing')} />
        </div>
      )}

      {/* Results */}
      {report && !isRunning && (
        <>
          {/* Overall Score */}
          <div className="relative z-10 flex justify-center">
            <QualityOverallScore score={report.overall_score} />
          </div>

          {/* Category Cards */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map(cat => (
              <QualityScoreCard
                key={cat.category}
                category={cat.category}
                score={cat.score}
                checksCount={cat.checks.length}
              />
            ))}
          </div>

          {/* Category Details */}
          <div className="relative z-10 space-y-2">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              {t('categoryDetails')}
            </h2>
            {categories.map(cat => (
              <QualityCategoryDetail key={cat.category} result={cat} />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!report && !isRunning && (
        <div className="relative z-10 glass-panel flex flex-col items-center py-16 px-6 text-center">
          <Play size={40} className="text-[var(--text-muted)] mb-4" aria-hidden="true" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">{t('noDiagnostic')}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{t('noDiagnosticHint')}</p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="relative z-10">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
            <History size={14} aria-hidden="true" />
            {t('history')}
          </h2>
          <div className="space-y-2">
            {history.slice(0, 5).map(h => (
              <Link
                key={h.id}
                href={`/admin/quality/reports/${h.id}`}
                className="glass-panel px-4 py-3 flex items-center justify-between hover:border-[var(--glass-border-hover)] transition-colors block"
              >
                <div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {t('score')}: {h.overall_score}/100
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-3">
                    {format.dateTime(new Date(h.created_at), {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    h.overall_score > 80
                      ? 'text-emerald-400'
                      : h.overall_score > 50
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {h.overall_score}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
