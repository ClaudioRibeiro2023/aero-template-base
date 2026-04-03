'use client'

import { useAuth } from '@/hooks/useAuth'
import { useUsers, useCreateUser, useUpdateUser, type Profile } from '@/hooks/useUsers'
import { useState } from 'react'
import { UserPlus, ShieldAlert } from 'lucide-react'
import { UserFormModal, type UserModalData } from './components/UserFormModal'
import { UsersTable } from './components/UsersTable'
import { UserFilters } from './components/UserFilters'

const PAGE_SIZE = 10

type ModalMode = 'create' | 'edit' | null

export default function UsersPage() {
  const { hasRole } = useAuth()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [editTarget, setEditTarget] = useState<Profile | null>(null)

  const {
    data: usersData,
    isLoading,
    isError,
  } = useUsers({
    search: search || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    active_only: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    page,
    page_size: PAGE_SIZE,
  })

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()

  const items = usersData?.items ?? []
  const totalUsers = usersData?.total ?? 0
  const totalPages = usersData?.pages ?? 1

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

  async function handleSave(data: UserModalData) {
    if (modalMode === 'create') {
      await createUser.mutateAsync({
        display_name: data.display_name,
        email: data.email,
        role: data.role as Profile['role'],
        is_active: data.is_active,
      })
    } else if (editTarget) {
      await updateUser.mutateAsync({
        id: editTarget.id,
        data: {
          display_name: data.display_name,
          role: data.role as Profile['role'],
          is_active: data.is_active,
        },
      })
    }
    closeModal()
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleRoleFilterChange(value: string) {
    setRoleFilter(value)
    setPage(1)
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  function handleClearFilters() {
    setSearch('')
    setRoleFilter('all')
    setStatusFilter('all')
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
              {isLoading
                ? 'Carregando...'
                : `${totalUsers} usuário${totalUsers !== 1 ? 's' : ''} encontrado${totalUsers !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity duration-150 self-start sm:self-auto hover:opacity-90"
            style={{ background: '#00b4d8' }}
          >
            <UserPlus size={15} aria-hidden="true" />
            Novo Usuário
          </button>
        </div>

        {/* Filters */}
        <UserFilters
          search={search}
          onSearchChange={handleSearchChange}
          roleFilter={roleFilter}
          onRoleFilterChange={handleRoleFilterChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
        />

        {/* Table */}
        <UsersTable
          users={items}
          total={totalUsers}
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          isError={isError}
          onPageChange={setPage}
          onEdit={openEdit}
          onClearFilters={handleClearFilters}
        />
      </main>

      {modalMode && (
        <UserFormModal
          mode={modalMode}
          user={editTarget}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </>
  )
}
