'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { CategoryResult } from '@/lib/quality-checks/types'
import { QualityCheckItem } from './QualityCheckItem'

export function QualityCategoryDetail({ result }: { result: CategoryResult }) {
  const [expanded, setExpanded] = useState(false)
  const color =
    result.score > 80 ? 'text-emerald-400' : result.score > 50 ? 'text-amber-400' : 'text-rose-400'

  return (
    <div className="glass-panel overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown size={16} className="text-[var(--text-muted)]" />
          ) : (
            <ChevronRight size={16} className="text-[var(--text-muted)]" />
          )}
          <span className="text-sm font-medium text-[var(--text-primary)]">{result.category}</span>
          <span className="text-xs text-[var(--text-muted)]">{result.checks.length} checks</span>
        </div>
        <span className={`text-sm font-bold ${color}`}>{result.score}/100</span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t border-[rgba(255,255,255,0.05)]">
          <div className="divide-y divide-[rgba(255,255,255,0.03)]">
            {result.checks.map((check, i) => (
              <QualityCheckItem key={i} check={check} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
