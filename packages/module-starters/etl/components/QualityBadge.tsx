import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

type QualityStatus = 'passed' | 'warning' | 'failed'

interface QualityBadgeProps {
  status: QualityStatus
  score?: number
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_CONFIG: Record<
  QualityStatus,
  { icon: typeof CheckCircle; color: string; bg: string; label: string }
> = {
  passed: {
    icon: CheckCircle,
    color: 'text-green-700 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    label: 'Aprovado',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-700 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Atenção',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    label: 'Reprovado',
  },
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
  lg: 'px-3 py-1.5 text-base gap-2',
}

const ICON_SIZES = {
  sm: 12,
  md: 14,
  lg: 18,
}

export default function QualityBadge({ status, score, size = 'md' }: QualityBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.color} ${SIZE_CLASSES[size]}`}
    >
      <Icon size={ICON_SIZES[size]} />
      <span>{config.label}</span>
      {typeof score === 'number' && <span className="opacity-75">({score}%)</span>}
    </span>
  )
}
