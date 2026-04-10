'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, ToggleLeft } from 'lucide-react'
import { useToast } from '@template/design-system'
import {
  useFeatureFlags,
  useCreateFeatureFlag,
  useUpdateFeatureFlag,
  useDeleteFeatureFlag,
  type FeatureFlag,
} from '@/hooks/useFeatureFlagsAdmin'

// ── Toggle row with rollout slider ──
function FlagRow({ flag }: { flag: FeatureFlag }) {
  const update = useUpdateFeatureFlag(flag.id)
  const remove = useDeleteFeatureFlag()
  const { success, error: toastError } = useToast()
  const [localRollout, setLocalRollout] = useState<number | null>(null)
  const rolloutPct = localRollout ?? flag.rollout_pct ?? 100

  async function handleToggle() {
    try {
      await update.mutateAsync({ enabled: !flag.enabled })
    } catch {
      toastError('Erro ao atualizar flag')
    }
  }

  async function handleRolloutChange(pct: number) {
    setLocalRollout(pct)
  }

  async function handleRolloutCommit() {
    if (localRollout === null) return
    try {
      await update.mutateAsync({ rollout_pct: localRollout })
      setLocalRollout(null)
    } catch {
      toastError('Erro ao atualizar rollout')
    }
  }

  async function handleDelete() {
    try {
      await remove.mutateAsync(flag.id)
      success('Flag removida')
    } catch {
      toastError('Erro ao remover flag')
    }
  }

  return (
    <div className="px-6 py-4 space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium font-mono text-[var(--text-primary)]">
            {flag.flag_name}
          </p>
          {flag.description && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{flag.description}</p>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={flag.enabled}
          onClick={handleToggle}
          disabled={update.isPending}
          className={`relative inline-flex h-6 w-11 rounded-full transition-all duration-200 disabled:opacity-60 flex-shrink-0 ${
            flag.enabled ? 'bg-[var(--brand-primary)]' : 'bg-[var(--bg-muted)]'
          }`}
          style={flag.enabled ? { boxShadow: '0 0 12px var(--glow-brand)' } : undefined}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
              flag.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Remover ${flag.flag_name}`}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {/* Rollout slider */}
      {flag.enabled && (
        <div className="flex items-center gap-3 pl-0">
          <span className="text-[11px] text-[var(--text-muted)] w-14 flex-shrink-0">Rollout</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={rolloutPct}
            onChange={e => handleRolloutChange(Number(e.target.value))}
            onMouseUp={handleRolloutCommit}
            onTouchEnd={handleRolloutCommit}
            className="flex-1 h-1.5 rounded-full appearance-none bg-white/10 accent-[var(--brand-primary)]"
            aria-label={`Rollout percentual para ${flag.flag_name}`}
          />
          <span className="text-xs font-mono text-[var(--text-secondary)] w-10 text-right flex-shrink-0">
            {rolloutPct}%
          </span>
        </div>
      )}
    </div>
  )
}

// ── Add form ──
function AddFlagForm({ onClose }: { onClose: () => void }) {
  const [flagName, setFlagName] = useState('')
  const [description, setDescription] = useState('')
  const [rolloutPct, setRolloutPct] = useState(100)
  const create = useCreateFeatureFlag()
  const { success, error: toastError } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!flagName.trim()) return
    try {
      await create.mutateAsync({
        flag_name: flagName.trim(),
        description: description.trim(),
        enabled: false,
        rollout_pct: rolloutPct,
      })
      success('Flag criada')
      onClose()
    } catch {
      toastError('Erro ao criar flag')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="px-6 py-4 border-t border-[var(--glass-border)] space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="new-flag-name"
            className="block text-xs font-medium text-[var(--text-muted)] mb-1"
          >
            Nome da flag <span className="text-rose-400">*</span>
          </label>
          <input
            id="new-flag-name"
            type="text"
            value={flagName}
            onChange={e => setFlagName(e.target.value)}
            placeholder="ex: nova_interface"
            className="w-full px-3 py-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/20 placeholder:text-[var(--text-muted)]"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Use apenas letras minusculas, numeros, _ ou -
          </p>
        </div>
        <div>
          <label
            htmlFor="new-flag-description"
            className="block text-xs font-medium text-[var(--text-muted)] mb-1"
          >
            Descricao
          </label>
          <input
            id="new-flag-description"
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descricao opcional"
            className="w-full px-3 py-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/20 placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>
      {/* Rollout slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--text-muted)] w-20 flex-shrink-0">Rollout inicial</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={rolloutPct}
          onChange={e => setRolloutPct(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full appearance-none bg-white/10 accent-[var(--brand-primary)]"
        />
        <span className="text-xs font-mono text-[var(--text-secondary)] w-10 text-right">
          {rolloutPct}%
        </span>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-[var(--glass-border)] text-sm text-[var(--text-secondary)] hover:bg-white/[0.03] transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!flagName.trim() || create.isPending}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          <Plus size={14} />
          Criar flag
        </button>
      </div>
    </form>
  )
}

// ── Page ──
export default function FeatureFlagsPage() {
  const { data, isLoading } = useFeatureFlags()
  const [showForm, setShowForm] = useState(false)
  const flags = data?.items ?? []

  return (
    <main className="page-enter ambient-gradient max-w-3xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Link
          href="/admin/config"
          className="p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Feature Flags</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Ative ou desative funcionalidades em tempo real
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--glass-border)] text-sm text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition-all"
        >
          <Plus size={14} />
          Nova flag
        </button>
      </div>

      <div className="relative z-10 glass-panel divide-y divide-[var(--glass-border)]">
        {/* Header row */}
        <div className="flex items-center px-6 py-3">
          <div className="flex-1 flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            <ToggleLeft size={14} />
            Flag
          </div>
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider pr-16">
            Status
          </span>
        </div>

        {isLoading && (
          <div className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
            Carregando...
          </div>
        )}

        {!isLoading && flags.length === 0 && !showForm && (
          <div className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
            Nenhuma feature flag configurada
          </div>
        )}

        {flags.map(flag => (
          <FlagRow key={flag.id} flag={flag} />
        ))}

        {showForm && <AddFlagForm onClose={() => setShowForm(false)} />}
      </div>
    </main>
  )
}
