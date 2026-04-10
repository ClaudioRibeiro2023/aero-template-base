'use client'

export function QualityScoreCard({
  category,
  score,
  checksCount,
}: {
  category: string
  score: number
  checksCount: number
}) {
  const color = score > 80 ? 'text-emerald-400' : score > 50 ? 'text-amber-400' : 'text-rose-400'
  const bgColor =
    score > 80 ? 'bg-emerald-500/10' : score > 50 ? 'bg-amber-500/10' : 'bg-rose-500/10'
  const ringColor =
    score > 80 ? 'stroke-emerald-400' : score > 50 ? 'stroke-amber-400' : 'stroke-rose-400'

  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="glass-panel p-4 flex items-center gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="4"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            className={ringColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}
        >
          {score}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{category}</p>
        <p className="text-xs text-[var(--text-muted)]">{checksCount} verificações</p>
        <span
          className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${bgColor} ${color}`}
        >
          {score > 80 ? 'Bom' : score > 50 ? 'Atenção' : 'Crítico'}
        </span>
      </div>
    </div>
  )
}
