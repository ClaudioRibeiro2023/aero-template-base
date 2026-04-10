'use client'

import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import type { CheckResult } from '@/lib/quality-checks/types'

const STATUS_ICON: Record<string, { icon: React.ElementType; className: string }> = {
  pass: { icon: CheckCircle, className: 'text-emerald-400' },
  warn: { icon: AlertTriangle, className: 'text-amber-400' },
  fail: { icon: XCircle, className: 'text-rose-400' },
}

export function QualityCheckItem({ check }: { check: CheckResult }) {
  const { icon: Icon, className } = STATUS_ICON[check.status] ?? STATUS_ICON.warn

  return (
    <div className="flex items-start gap-3 py-2">
      <Icon size={16} className={`flex-shrink-0 mt-0.5 ${className}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--text-primary)]">{check.name}</p>
          <span className="text-xs text-[var(--text-muted)] flex-shrink-0">{check.score}/100</span>
        </div>
        {check.details && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{check.details}</p>
        )}
        {check.recommendation && (
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5 italic">
            {check.recommendation}
          </p>
        )}
      </div>
    </div>
  )
}
