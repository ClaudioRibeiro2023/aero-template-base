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
import { ToastItem, Modal } from '@template/design-system'

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
    if (isEdit) {
      await updateTask.mutateAsync(values)
    } else {
      await createTask.mutateAsync(values)
    }
    onClose()
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
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            {...register('title')}
          />
          {errors.title && (
            <p id="task-title-error" role="alert" className="mt-1 text-xs text-rose-400">
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
            aria-describedby={errors.description ? 'task-description-error' : undefined}
            {...register('description')}
          />
          {errors.description && (
            <p id="task-description-error" role="alert" className="mt-1 text-xs text-rose-400">
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
}: {
  task: Task
  onEdit: (t: Task) => void
  onDelete: (id: string) => void
}) {
  const StatusIcon = STATUS_ICONS[task.status]

  return (
    <div className="glass-panel px-4 py-3 flex items-center gap-4 hover:border-[var(--glass-border-hover)] transition-colors group">
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
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label={`Editar task: ${task.title}`}
        >
          <Pencil size={14} aria-hidden="true" />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[var(--text-muted)] hover:text-rose-400 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
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

  const { data, isLoading, isError } = useTasks(filters)
  const deleteTask = useDeleteTask()

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
      <div className="relative z-10 flex flex-wrap gap-2">
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
          <div className="glass-panel flex flex-col items-center py-16 px-6 text-center">
            <CheckCircle2 size={40} className="text-[var(--text-muted)] mb-4" aria-hidden="true" />
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              Nenhuma task encontrada
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Clique em &quot;Nova Task&quot; para começar
            </p>
          </div>
        )}

        {tasks.map(task => (
          <TaskRow key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete} />
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
