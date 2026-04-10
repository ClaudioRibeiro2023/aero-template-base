'use client'

function getGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: 'A', color: 'text-emerald-400' }
  if (score >= 80) return { grade: 'B', color: 'text-emerald-400' }
  if (score >= 70) return { grade: 'C', color: 'text-amber-400' }
  if (score >= 50) return { grade: 'D', color: 'text-amber-400' }
  return { grade: 'F', color: 'text-rose-400' }
}

export function QualityOverallScore({ score }: { score: number }) {
  const { grade, color } = getGrade(score)
  const ringColor =
    score >= 70 ? 'stroke-emerald-400' : score >= 50 ? 'stroke-amber-400' : 'stroke-rose-400'

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="glass-panel p-6 flex flex-col items-center">
      <div className="relative w-32 h-32 mb-3">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            className={ringColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score}</span>
          <span className={`text-lg font-bold ${color}`}>{grade}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-[var(--text-primary)]">Score Geral</p>
      <p className="text-xs text-[var(--text-muted)]">Média de todas as categorias</p>
    </div>
  )
}
