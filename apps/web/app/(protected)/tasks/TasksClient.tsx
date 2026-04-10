'use client'

/**
 * TasksClient — UI interativa da página de Tasks.
 *
 * Sprint 7 (P1-01): Demonstra padrão completo de CRUD:
 * - Listagem com filtros e paginação
 * - Formulário com react-hook-form + Zod
 * - Optimistic updates via React Query
 * - Toast feedback para operações
 * - Teclado-acessível (aria-describedby, labels, roles)
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  taskCreateSchema,
  taskUpdateSchema,
  type TaskCreateFormValues,
} from '@template/shared/schemas'
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  type Task,
  type TaskStatus,
  type TaskFilters,
} from '@/hooks/useTasks'
import { ToastItem, Modal, useToast, EmptyState } from '@template/design-system'
import { BulkActionBar } from '@/components/common/BulkActionBar'
import { exportToCsv } from '@/lib/export-csv'
import { useRealtimeTasks } from '@/hooks/useRealtimeSubscription'

// ── Helpers ──
const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'A Fazer',
  in_progress: 'Em Andamento',
  done: 'Concluída',
  cancelled: 'Cancelada',
}

const STATUS_ICONS: Record<TaskStatus, React.ElementType> = {
  todo: Circle,
  in_progress: Clock,
  done: CheckCircle2,
  cancelled: XCircle,
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'text-zinc-400',
  in_progress: 'text-[var(--accent-amber)]',
  done: 'text-emerald-400',
  cancelled: 'text-rose-400',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-zinc-500/20 text-zinc-400',
  medium: 'bg-[var(--accent-amber)]/10 text-amber-400',
  high: 'bg-orange-500/10 text-orange-400',
  critical: 'bg-rose-500/10 text-rose-400',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
}

// ── Task Form Modal ──
function TaskFormModal({ task, onClose }: { task?: Task; onClose: () => void }) {
  const isEdit = !!task
  const createTask = useCreateTask()
  const updateTask = useUpdateTask(task?.id ?? '')
  const isPending = createTask.isPending || updateTask.isPending
  const { error: toastError } = useToast()

  const schema = isEdit ? taskUpdateSchema : taskCreateSchema
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          priority: task.priority,
        }
      : { status: 'todo', priority: 'medium' },
  })

  async function onSubmit(values: TaskCreateFormValues) {
    try {
      if (isEdit) {
        await updateTask.mutateAsync(values)
      } else {
        await createTask.mutateAsync(values)
      }
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar task'
      toastError(msg === 'Unauthorized' ? 'Sessão expirada. Faça login novamente.' : msg)
    }
  }

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-[rgba(255,255,255,0.08)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/30 transition-colors'

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Editar Task' : 'Nova Task'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Title */}
        <div>
          <label
            htmlFor="task-title"
            className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
          >
            Título <span aria-hidden="true">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className={inputClass}
            placeholder="Ex: Implementar autenticação"
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            {...register('title')}
          />
          {errors.title && (
            <p
              id="task-title-error"
              role="alert"
              aria-live="polite"
              className="mt-1 text-xs text-rose-400"
            >
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="task-description"
            className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
          >
            Descrição
          </label>
          <textarea
            id="task-description"
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Detalhes da task (opcional)"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'task-description-error' : undefined}
            {...register('description')}
          />
          {errors.description && (
            <p
              id="task-description-error"
              role="alert"
              aria-live="polite"
              className="mt-1 text-xs text-rose-400"
            >
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Status + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="task-status"
              className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
            >
              Status
            </label>
            <select id="task-status" className={inputClass} {...register('status')}>
              <option value="todo">A Fazer</option>
              <option value="in_progress">Em Andamento</option>
              <option value="done">Concluída</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="task-priority"
              className="block text-xs font-medium text-[var(--text-secondary)] mb-1"
            >
              Prioridade
            </label>
            <select id="task-priority" className={inputClass} {...register('priority')}>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2 text-sm font-medium rounded-lg border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:bg-white/[0.03] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            {isEdit ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Task Row ──
function TaskRow({
  task,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
}: {
  task: Task
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
}) {
  const StatusIcon = STATUS_ICONS[task.status]

  return (
    <div className="glass-panel px-4 py-3 flex items-center gap-4 hover:border-[var(--glass-border-hover)] transition-colors group">
      {onToggleSelect && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(task.id)}
          className="accent-[var(--brand-primary)] w-3.5 h-3.5 flex-shrink-0"
          aria-label={`Selecionar task: ${task.title}`}
        />
      )}
      <StatusIcon
        size={18}
        className={`flex-shrink-0 ${STATUS_COLORS[task.status]}`}
        aria-label={`Status: ${STATUS_LABELS[task.status]}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{task.title}</p>
        {task.description && (
          <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{task.description}</p>
        )}
      </div>
      <span
        className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}
      >
        {PRIORITY_LABELS[task.priority]}
      </span>
      <span className="text-[11px] text-[var(--text-muted)] flex-shrink-0 hidden sm:block">
        {new Date(task.updated_at).toLocaleDateString('pt-BR')}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={`Editar task: ${task.title}`}
        >
          <Pencil size={14} aria-hidden="true" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[var(--text-muted)] hover:text-rose-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={`Excluir task: ${task.title}`}
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ── Main ──
export function TasksClient() {
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, page_size: 20 })
  const [modalTask, setModalTask] = useState<Task | undefined>()
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const { data, isLoading, isError } = useTasks(filters)
  const deleteTask = useDeleteTask()

  // Real-time: lista atualiza automaticamente quando colegas criam/editam tasks
  useRealtimeTasks()

  const tasks = data?.data ?? []
  const meta = data?.meta

  function openCreate() {
    setModalTask(undefined)
    setShowModal(true)
  }

  function openEdit(task: Task) {
    setModalTask(task)
    setShowModal(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Confirmar exclusão desta task?')) return
    try {
      await deleteTask.mutateAsync(id)
      setToast({ message: 'Task excluída com sucesso', type: 'success' })
    } catch {
      setToast({ message: 'Erro ao excluir task', type: 'error' })
    }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === tasks.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(tasks.map(t => t.id)))
    }
  }

  function handleBulkExport() {
    const selectedTasks = tasks.filter(t => selected.has(t.id)) as unknown as Record<
      string,
      unknown
    >[]
    exportToCsv(selectedTasks, 'tasks', [
      { key: 'title', label: 'Título' },
      { key: 'status', label: 'Status', format: v => STATUS_LABELS[v as TaskStatus] || String(v) },
      {
        key: 'priority',
        label: 'Prioridade',
        format: v => PRIORITY_LABELS[v as string] || String(v),
      },
      {
        key: 'updated_at',
        label: 'Atualizado',
        format: v => new Date(v as string).toLocaleDateString('pt-BR'),
      },
    ])
    setToast({ message: `${selectedTasks.length} tasks exportadas`, type: 'success' })
    setSelected(new Set())
  }

  async function handleBulkDelete() {
    if (!confirm(`Excluir ${selected.size} tasks selecionadas?`)) return
    for (const id of selected) {
      try {
        await deleteTask.mutateAsync(id)
      } catch {
        /* continue */
      }
    }
    setToast({ message: `${selected.size} tasks excluídas`, type: 'success' })
    setSelected(new Set())
  }

  return (
    <main className="page-enter ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tarefas</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {meta?.total != null
              ? `${meta.total} tarefas no total`
              : 'Gerenciar tarefas do projeto'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-colors min-h-[44px] flex-shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Nova Task
        </button>
      </div>

      {/* Filters */}
      <div className="relative z-10 flex flex-wrap items-center gap-2">
        {tasks.length > 0 && (
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--text-muted)] mr-2">
            <input
              type="checkbox"
              checked={tasks.length > 0 && selected.size === tasks.length}
              onChange={toggleSelectAll}
              className="accent-[var(--brand-primary)] w-3.5 h-3.5"
            />
            Todos
          </label>
        )}
        {(['', 'todo', 'in_progress', 'done', 'cancelled'] as const).map(s => (
          <button
            key={s || 'all'}
            onClick={() => setFilters(f => ({ ...f, status: s || undefined, page: 1 }))}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors min-h-[36px] ${
              (filters.status ?? '') === s
                ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30 text-[var(--brand-primary)]'
                : 'border-[rgba(255,255,255,0.08)] text-[var(--text-muted)] hover:border-[rgba(255,255,255,0.15)]'
            }`}
            aria-pressed={(filters.status ?? '') === s}
          >
            {s ? STATUS_LABELS[s as TaskStatus] : 'Todas'}
          </button>
        ))}
      </div>

      {/* Task list */}
      <section
        aria-label="Lista de tasks"
        aria-busy={isLoading}
        className="relative z-10 space-y-2"
      >
        {isLoading && (
          <div className="flex items-center justify-center py-16" aria-label="Carregando tasks">
            <Loader2
              size={24}
              className="animate-spin text-[var(--brand-primary)]"
              aria-hidden="true"
            />
          </div>
        )}

        {isError && (
          <div role="alert" className="glass-panel p-6 text-center text-sm text-rose-400">
            Erro ao carregar tasks. Tente novamente.
          </div>
        )}

        {!isLoading && !isError && tasks.length === 0 && (
          <EmptyState
            icon={<CheckCircle2 size={40} />}
            title="Nenhuma task encontrada"
            description="Crie sua primeira tarefa para começar a organizar o trabalho"
            actions={
              <button
                onClick={openCreate}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-colors"
              >
                Nova Task
              </button>
            }
          />
        )}

        {tasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            onEdit={openEdit}
            onDelete={handleDelete}
            isSelected={selected.has(task.id)}
            onToggleSelect={toggleSelect}
          />
        ))}
      </section>

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <nav aria-label="Paginação" className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
            disabled={!meta || (filters.page ?? 1) <= 1}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] glass-panel hover:border-[var(--glass-border-hover)] transition-colors disabled:opacity-40 min-h-[44px]"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Anterior
          </button>
          <span className="text-xs text-[var(--text-muted)]">
            Página {filters.page ?? 1} de {meta?.pages ?? 1}
          </span>
          <button
            onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}
            disabled={!meta || (filters.page ?? 1) >= meta.pages}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] glass-panel hover:border-[var(--glass-border-hover)] transition-colors disabled:opacity-40 min-h-[44px]"
          >
            Próxima
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}

      {/* Modal */}
      {showModal && (
        <TaskFormModal
          task={modalTask}
          onClose={() => {
            setShowModal(false)
            setModalTask(undefined)
          }}
        />
      )}

      {/* Bulk Actions */}
      <BulkActionBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        actions={[
          { label: 'Exportar CSV', onClick: handleBulkExport, variant: 'secondary' },
          { label: 'Excluir', onClick: handleBulkDelete, variant: 'danger' },
        ]}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100]">
          <ToastItem
            id="tasks-toast"
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </main>
  )
}
