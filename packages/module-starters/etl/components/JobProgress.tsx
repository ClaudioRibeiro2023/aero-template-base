import { CheckCircle, XCircle, Loader2, Clock, AlertTriangle } from 'lucide-react'
import { Progress } from '@template/design-system'
import type { ImportJob, ImportStatus } from '../types'

interface JobProgressProps {
  job: ImportJob
}

const STATUS_CONFIG: Record<ImportStatus, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-gray-500', label: 'Pendente' },
  running: { icon: Loader2, color: 'text-blue-500', label: 'Em execução' },
  completed: { icon: CheckCircle, color: 'text-green-500', label: 'Concluído' },
  failed: { icon: XCircle, color: 'text-red-500', label: 'Falha' },
  cancelled: { icon: XCircle, color: 'text-gray-400', label: 'Cancelado' },
}

export default function JobProgress({ job }: JobProgressProps) {
  const config = STATUS_CONFIG[job.status]
  const StatusIcon = config.icon

  return (
    <div className="bg-surface-elevated rounded-lg border border-border-default p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon
            size={20}
            className={`${config.color} ${job.status === 'running' ? 'animate-spin' : ''}`}
          />
          <span className="font-medium text-text-primary">{job.sourceName}</span>
        </div>
        <span className={`text-sm ${config.color}`}>{config.label}</span>
      </div>

      {/* Progress Bar */}
      {job.status === 'running' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-text-muted mb-1">
            <span>
              {job.recordsProcessed?.toLocaleString() || 0} /{' '}
              {job.recordsTotal?.toLocaleString() || '?'} registros
            </span>
            <span>{job.progress}%</span>
          </div>
          <Progress value={job.progress} variant="primary" size="sm" />
        </div>
      )}

      {/* Stats */}
      {job.status === 'completed' && (
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-surface-muted rounded">
            <div className="text-text-muted text-xs">Total</div>
            <div className="font-medium text-text-primary">
              {job.recordsTotal?.toLocaleString() || 0}
            </div>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="text-green-600 text-xs">Sucesso</div>
            <div className="font-medium text-green-700 dark:text-green-400">
              {job.recordsSuccess?.toLocaleString() || 0}
            </div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <div className="text-red-600 text-xs">Erros</div>
            <div className="font-medium text-red-700 dark:text-red-400">
              {job.recordsError?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {job.status === 'failed' && job.errorMessage && (
        <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-400">{job.errorMessage}</span>
        </div>
      )}

      {/* Timestamps */}
      <div className="mt-3 pt-3 border-t border-border-default flex justify-between text-xs text-text-muted">
        {job.startedAt && <span>Início: {new Date(job.startedAt).toLocaleString('pt-BR')}</span>}
        {job.completedAt && <span>Fim: {new Date(job.completedAt).toLocaleString('pt-BR')}</span>}
      </div>
    </div>
  )
}
