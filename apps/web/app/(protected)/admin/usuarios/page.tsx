'use client'

import { useAuth } from '@/hooks/useAuth'
import { useState, useMemo } from 'react'
import { Search, UserPlus, ChevronLeft, ChevronRight, X, Save } from 'lucide-react'

interface Profile {
  id: string
  display_name: string
  email: string
  role: string
  is_active: boolean
}

// Mock data (em produção: buscar do Supabase)
const INITIAL_USERS: Profile[] = [
  {
    id: '1',
    display_name: 'Admin Demo',
    email: 'admin@template.dev',
    role: 'ADMIN',
    is_active: true,
  },
  {
    id: '2',
    display_name: 'Gestor Teste',
    email: 'gestor@template.dev',
    role: 'GESTOR',
    is_active: true,
  },
  {
    id: '3',
    display_name: 'Operador 1',
    email: 'op1@template.dev',
    role: 'OPERADOR',
    is_active: true,
  },
  {
    id: '4',
    display_name: 'Viewer A',
    email: 'viewer@template.dev',
    role: 'VIEWER',
    is_active: false,
  },
  {
    id: '5',
    display_name: 'Operador 2',
    email: 'op2@template.dev',
    role: 'OPERADOR',
    is_active: true,
  },
]

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  GESTOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  OPERADOR: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  VIEWER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const PAGE_SIZE = 10

type ModalMode = 'create' | 'edit' | null

function UserModal({
  mode,
  user,
  onClose,
  onSave,
}: {
  mode: ModalMode
  user: Profile | null
  onClose: () => void
  onSave: (data: Omit<Profile, 'id'>) => void
}) {
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [role, setRole] = useState(user?.role || 'VIEWER')
  const [isActive, setIsActive] = useState(user?.is_active ?? true)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    onSave({ display_name: displayName, email, role, is_active: isActive })
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'create' ? 'Criar usuário' : 'Editar usuário'}
    >
      <div className="w-full max-w-md rounded-xl bg-[var(--surface-raised)] border border-[var(--border-default)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
          <h2 className="text-base font-semibold">
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-base)] transition-colors text-[var(--text-muted)]"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Nome de exibição</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm"
              placeholder="Ex: João Silva"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm"
              placeholder="joao@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm"
            >
              <option value="VIEWER">Viewer — somente leitura</option>
              <option value="OPERADOR">Operador — leitura e operação</option>
              <option value="GESTOR">Gestor — gestão de módulos</option>
              <option value="ADMIN">Admin — acesso total</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${isActive ? 'bg-[var(--brand-primary)]' : 'bg-[var(--border-default)]'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
            <span className="text-sm">Usuário ativo</span>
          </label>

          {/* Actions */}
          <div className="flex gap-2 pt-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--border-default)] text-sm hover:bg-[var(--surface-base)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-60"
            >
              <Save size={14} />
              {saving ? 'Salvando...' : mode === 'create' ? 'Criar usuário' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { hasRole } = useAuth()
  const [users, setUsers] = useState<Profile[]>(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<Profile | null>(null)

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        !search ||
        u.display_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.is_active) ||
        (statusFilter === 'inactive' && !u.is_active)
      return matchSearch && matchRole && matchStatus
    })
  }, [users, search, roleFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openCreate() {
    setEditTarget(null)
    setModalMode('create')
  }

  function openEdit(u: Profile) {
    setEditTarget(u)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setEditTarget(null)
  }

  function handleSave(data: Omit<Profile, 'id'>) {
    if (modalMode === 'create') {
      setUsers(prev => [...prev, { id: Date.now().toString(), ...data }])
    } else if (editTarget) {
      setUsers(prev => prev.map(u => (u.id === editTarget.id ? { ...u, ...data } : u)))
    }
    closeModal()
  }

  if (!hasRole('ADMIN')) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Acesso negado</h1>
      </main>
    )
  }

  return (
    <>
      <main className="page-enter max-w-6xl mx-auto p-4 sm:p-8 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Usuários</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {filtered.length} usuário{filtered.length !== 1 ? 's' : ''} encontrado
              {filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            <UserPlus size={15} />
            Novo Usuário
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] text-sm"
          >
            <option value="all">Todas as roles</option>
            <option value="ADMIN">Admin</option>
            <option value="GESTOR">Gestor</option>
            <option value="OPERADOR">Operador</option>
            <option value="VIEWER">Viewer</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-raised)] text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[var(--border-default)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-[var(--surface-base)]">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Nome
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-sm text-[var(--text-muted)]">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  paginated.map(u => (
                    <tr key={u.id} className="hover:bg-[var(--surface-base)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] text-xs font-semibold flex-shrink-0">
                            {u.display_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">{u.display_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden sm:table-cell">
                        {u.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${ROLE_COLORS[u.role] || ''}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`flex items-center gap-1 text-xs font-medium ${u.is_active ? 'text-green-600' : 'text-red-500'}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-400'}`}
                          />
                          {u.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(u)}
                          className="text-xs text-[var(--brand-primary)] hover:underline"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-default)] bg-[var(--surface-base)]">
            <p className="text-sm text-[var(--text-muted)]">
              Mostrando {filtered.length} de {users.length} usuários
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md border border-[var(--border-default)] disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-[var(--text-secondary)] px-2">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-md border border-[var(--border-default)] disabled:opacity-40"
                aria-label="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {modalMode && (
        <UserModal mode={modalMode} user={editTarget} onClose={closeModal} onSave={handleSave} />
      )}
    </>
  )
}
