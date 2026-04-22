import {
  Upload,
  FileJson,
  Map,
  Plug,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import type { DataSourceType, ImportStatus } from '../types'

interface ImportCardProps {
  title: string
  subtitle: string
  type: DataSourceType
  status?: ImportStatus
  progress?: number
  onClick?: () => void
  disabled?: boolean
}

const TYPE_ICONS: Record<DataSourceType, typeof Upload> = {
  csv: Upload,
  json: FileJson,
  shapefile: Map,
  api: Plug,
  database: Database,
}

const STATUS_ICONS: Record<ImportStatus, typeof Clock> = {
  pending: Clock,
  running: Loader2,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
}

const STATUS_COLORS: Record<ImportStatus, string> = {
  pending: 'text-gray-500',
  running: 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
  cancelled: 'text-gray-400',
}

export default function ImportCard({
  title,
  subtitle,
  type,
  status,
  progress,
  onClick,
  disabled,
}: ImportCardProps) {
  const TypeIcon = TYPE_ICONS[type]
  const StatusIcon = status ? STATUS_ICONS[status] : null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-full p-4 rounded-lg border transition-all text-left
        ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-muted' : 'hover:border-brand-primary hover:shadow-md cursor-pointer bg-surface-elevated'}
        border-border-default
      `}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <TypeIcon size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary truncate">{title}</h3>
          <p className="text-sm text-text-secondary line-clamp-2">{subtitle}</p>
        </div>
        {StatusIcon && (
          <StatusIcon
            size={20}
            className={`${STATUS_COLORS[status!]} ${status === 'running' ? 'animate-spin' : ''}`}
          />
        )}
      </div>

      {typeof progress === 'number' && status === 'running' && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </button>
  )
}
