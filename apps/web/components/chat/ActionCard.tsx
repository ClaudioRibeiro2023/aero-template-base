'use client'

/**
 * ActionCard — card de confirmação para ações pendentes do agente.
 *
 * Sprint 6: exibe preview da ação proposta com botões de confirmar/cancelar.
 * Mostra: tool, descrição, impacto, detalhes, e feedback pós-ação.
 */
import { Check, X, AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react'

export interface ActionCardData {
  id: string
  toolName: string
  description: string
  impact: string
  details?: Record<string, unknown>
  status: 'pending' | 'confirming' | 'confirmed' | 'cancelled' | 'executed' | 'failed'
}

interface ActionCardProps {
  action: ActionCardData
  onConfirm: (actionId: string) => void
  onCancel: (actionId: string) => void
}

const toolLabels: Record<string, string> = {
  create_task: 'Criar Tarefa',
  update_task_status: 'Atualizar Status',
  update_task_priority: 'Alterar Prioridade',
  assign_task: 'Atribuir Tarefa',
}

export function ActionCard({ action, onConfirm, onCancel }: ActionCardProps) {
  const isPending = action.status === 'pending'
  const isConfirming = action.status === 'confirming'
  const isExecuted = action.status === 'executed' || action.status === 'confirmed'
  const isCancelled = action.status === 'cancelled'
  const isFailed = action.status === 'failed'

  return (
    <div
      className={`rounded-xl border px-4 py-3 space-y-2 text-sm ${
        isPending || isConfirming
          ? 'border-amber-500/30 bg-amber-500/[0.05]'
          : isExecuted
            ? 'border-green-500/30 bg-green-500/[0.05]'
            : isCancelled
              ? 'border-zinc-500/30 bg-zinc-500/[0.05]'
              : 'border-red-500/30 bg-red-500/[0.05]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium text-[var(--text-primary)]">
          {toolLabels[action.toolName] ?? action.toolName}
        </span>
        {isExecuted && <CheckCircle size={14} className="text-green-400 ml-auto" />}
        {isCancelled && <XCircle size={14} className="text-zinc-400 ml-auto" />}
        {isFailed && <XCircle size={14} className="text-red-400 ml-auto" />}
      </div>

      {/* Description */}
      <p className="text-[var(--text-secondary)]">{action.description}</p>

      {/* Impact */}
      <p className="text-xs text-[var(--text-muted)]">
        <strong>Impacto:</strong> {action.impact}
      </p>

      {/* Details */}
      {action.details && Object.keys(action.details).length > 0 && (
        <div className="bg-white/[0.03] rounded-lg px-3 py-2 space-y-1">
          {Object.entries(action.details).map(([key, value]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)]">{key.replace(/_/g, ' ')}</span>
              <span className="text-[var(--text-secondary)] font-mono truncate max-w-[180px]">
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => onConfirm(action.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-medium transition-colors"
          >
            <Check size={12} aria-hidden="true" />
            Confirmar
          </button>
          <button
            type="button"
            onClick={() => onCancel(action.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium transition-colors"
          >
            <X size={12} aria-hidden="true" />
            Cancelar
          </button>
        </div>
      )}

      {isConfirming && (
        <div className="flex items-center gap-2 text-xs text-amber-400">
          <Loader2 size={12} className="animate-spin" aria-hidden="true" />
          Executando...
        </div>
      )}

      {isExecuted && <p className="text-xs text-green-400">Ação executada com sucesso</p>}

      {isCancelled && <p className="text-xs text-zinc-400">Ação cancelada</p>}

      {isFailed && <p className="text-xs text-red-400">Falha na execução</p>}
    </div>
  )
}
