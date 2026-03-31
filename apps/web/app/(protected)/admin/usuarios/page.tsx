'use client'

import { useAuth } from '@/hooks/useAuth'
import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Pencil,
  Users,
  ShieldAlert,
} from 'lucide-react'

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

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: 'rgba(167,139,250,0.10)', text: '#a78bfa' },
  GESTOR: { bg: 'rgba(96,165,250,0.10)', text: '#60a5fa' },
  OPERADOR: { bg: 'rgba(52,211,153,0.10)', text: '#34d399' },
  VIEWER: { bg: 'rgba(161,161,170,0.10)', text: '#a1a1aa' },
}

const PAGE_SIZE = 10

type ModalMode = 'create' | 'edit' | null

/* ========================================================================== */
/* Modal de Usuário — "Focus Overlay" glass                                    */
/* ========================================================================== */

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
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, 180)
  }, [onClose])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handleClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 500))
    onSave({ display_name: displayName, email, role, is_active: isActive })
    setSaving(false)
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: visible ? 'rgba(0,0,0,0.70)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        WebkitBackdropFilter: visible ? 'blur(8px)' : 'blur(0px)',
        transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) handleClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'create' ? 'Criar usuário' : 'Editar usuário'}
    >
      <div
        className="w-full max-w-md overflow-hidden"
        style={{
          background: 'rgba(24, 24, 27, 0.85)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.06), 0 0 40px rgba(0,0,0,0.5), 0 25px 50px rgba(0,0,0,0.4)',
          transform: visible ? 'scale(1)' : 'scale(0.96)',
          opacity: visible ? 1 : 0,
          transition:
            'transform 250ms cubic-bezier(0.16, 1, 0.3, 1), opacity 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="text-[15px] font-semibold text-zinc-100">
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </h2>
          <button
            onClick={handleClose}
            className="flex items-center justify-center rounded-lg text-zinc-500 transition-colors duration-150"
            style={{ width: 32, height: 32 }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label
              htmlFor="modal-display-name"
              className="block text-[13px] font-medium text-zinc-400 mb-1.5"
            >
              Nome de exibição *
            </label>
            <input
              id="modal-display-name"
              type="text"
              required
              aria-required="true"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#00b4d8'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.15)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label
              htmlFor="modal-email"
              className="block text-[13px] font-medium text-zinc-400 mb-1.5"
            >
              Email *
            </label>
            <input
              id="modal-email"
              type="email"
              required
              aria-required="true"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#00b4d8'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.15)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              placeholder="joao@empresa.com"
            />
          </div>

          <div>
            <label
              htmlFor="modal-role"
              className="block text-[13px] font-medium text-zinc-400 mb-1.5"
            >
              Role
            </label>
            <select
              id="modal-role"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-sm text-zinc-100 outline-none transition-all duration-150 appearance-none cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#00b4d8'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.15)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <option value="VIEWER">Viewer — somente leitura</option>
              <option value="OPERADOR">Operador — leitura e operação</option>
              <option value="GESTOR">Gestor — gestão de módulos</option>
              <option value="ADMIN">Admin — acesso total</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="modal-is-active"
              type="button"
              role="switch"
              aria-checked={isActive}
              aria-label="Usuário ativo"
              onClick={() => setIsActive(!isActive)}
              className="relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200"
              style={{
                width: 40,
                height: 20,
                background: isActive ? '#00b4d8' : 'rgba(63,63,70,1)',
                boxShadow: isActive ? '0 0 8px rgba(0,180,216,0.3)' : 'none',
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 rounded-full bg-white shadow-sm transition-transform duration-200"
                style={{
                  width: 16,
                  height: 16,
                  transform: isActive ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </button>
            <label
              htmlFor="modal-is-active"
              className="text-sm text-zinc-300 cursor-pointer select-none"
            >
              Usuário ativo
            </label>
          </div>

          {/* Footer actions */}
          <div
            className="flex gap-3 pt-4 justify-end -mx-6 -mb-6 px-6 py-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 transition-colors duration-150"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity duration-150 disabled:opacity-50"
              style={{ background: '#00b4d8' }}
              onMouseEnter={e => {
                if (!saving) e.currentTarget.style.opacity = '0.9'
              }}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
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

/* ========================================================================== */
/* Página Admin Usuários — "Data Grid Premium"                                 */
/* ========================================================================== */

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
      <main className="flex items-center justify-center min-h-[60vh]">
        <div
          className="flex flex-col items-center gap-4 p-8 rounded-2xl text-center"
          style={{
            background: 'rgba(24, 24, 27, 0.72)',
            backdropFilter: 'blur(12px) saturate(1.2)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <ShieldAlert size={48} className="text-zinc-600" />
          <h1 className="text-lg font-semibold text-zinc-200">Acesso negado</h1>
          <p className="text-sm text-zinc-500">Você não tem permissão para acessar esta página.</p>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="page-enter max-w-6xl mx-auto p-4 sm:p-8 space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Usuários</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">
              {filtered.length} usuário{filtered.length !== 1 ? 's' : ''} encontrado
              {filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity duration-150 self-start sm:self-auto"
            style={{ background: '#00b4d8' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <UserPlus size={15} />
            Novo Usuário
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full h-10 pl-9 pr-3 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#00b4d8'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.15)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="h-10 px-3 rounded-lg text-sm text-zinc-300 outline-none transition-all duration-150 appearance-none cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#00b4d8'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.15)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.boxShadow = 'none'
            }}
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
            className="h-10 px-3 rounded-lg text-sm text-zinc-300 outline-none transition-all duration-150 appearance-none cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#00b4d8'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,180,216,0.15)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {/* Table — Data Grid Premium */}
        <div
          className="overflow-hidden"
          style={{
            background: 'rgba(24, 24, 27, 0.72)',
            backdropFilter: 'blur(12px) saturate(1.2)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <Users size={48} className="text-zinc-700" />
                        <p className="text-sm font-medium text-zinc-400">
                          Nenhum usuário encontrado
                        </p>
                        <p className="text-[13px] text-zinc-600">
                          Tente ajustar os filtros de busca
                        </p>
                        <button
                          onClick={() => {
                            setSearch('')
                            setRoleFilter('all')
                            setStatusFilter('all')
                          }}
                          className="mt-1 px-4 py-1.5 rounded-lg text-[13px] text-zinc-400 transition-colors duration-150"
                          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                          onMouseEnter={e =>
                            (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')
                          }
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          Limpar filtros
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map(u => {
                    const roleStyle = ROLE_COLORS[u.role] || ROLE_COLORS.VIEWER
                    return (
                      <tr
                        key={u.id}
                        className="transition-colors duration-100"
                        style={{
                          height: 48,
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          opacity: u.is_active ? 1 : 0.6,
                        }}
                        onMouseEnter={e =>
                          (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')
                        }
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Nome + Avatar */}
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex items-center justify-center shrink-0 rounded-full font-mono text-[11px] font-semibold"
                              style={{
                                width: 28,
                                height: 28,
                                background: 'rgba(0,180,216,0.10)',
                                color: '#00b4d8',
                              }}
                            >
                              {u.display_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-zinc-200">
                              {u.display_name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-2 text-sm text-zinc-500 hidden sm:table-cell">
                          {u.email}
                        </td>

                        {/* Role Badge */}
                        <td className="px-4 py-2">
                          <span
                            className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium"
                            style={{
                              background: roleStyle.bg,
                              color: roleStyle.text,
                            }}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Status Dot */}
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="rounded-full"
                              style={{
                                width: 8,
                                height: 8,
                                background: u.is_active ? '#34d399' : '#52525b',
                                boxShadow: u.is_active ? '0 0 6px rgba(52,211,153,0.4)' : 'none',
                              }}
                            />
                            <span className="text-[13px] text-zinc-400">
                              {u.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={() => openEdit(u)}
                            className="inline-flex items-center justify-center rounded-md text-zinc-500 transition-colors duration-150"
                            style={{ width: 28, height: 28 }}
                            onMouseEnter={e =>
                              (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')
                            }
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            aria-label={`Editar ${u.display_name}`}
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.04)',
              background: 'rgba(255,255,255,0.01)',
            }}
          >
            <p className="text-[13px] text-zinc-600">
              Mostrando {paginated.length} de {users.length} usuários
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center justify-center rounded-md transition-colors duration-150"
                style={{
                  width: 28,
                  height: 28,
                  border: '1px solid rgba(255,255,255,0.08)',
                  opacity: page === 1 ? 0.3 : 1,
                }}
                onMouseEnter={e => {
                  if (page !== 1) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                aria-label="Página anterior"
              >
                <ChevronLeft size={14} className="text-zinc-400" />
              </button>
              <span className="text-[13px] text-zinc-500 px-2 select-none">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center justify-center rounded-md transition-colors duration-150"
                style={{
                  width: 28,
                  height: 28,
                  border: '1px solid rgba(255,255,255,0.08)',
                  opacity: page === totalPages ? 0.3 : 1,
                }}
                onMouseEnter={e => {
                  if (page !== totalPages)
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                aria-label="Próxima página"
              >
                <ChevronRight size={14} className="text-zinc-400" />
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
