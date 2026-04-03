'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, Shield, ShieldCheck, Lock } from 'lucide-react'
import { useToast, Modal } from '@template/design-system'
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  type RoleDefinition,
} from '@/hooks/useRoles'
import { PERMISSIONS_BY_RESOURCE, type PermissionResource, type Permission } from '@template/shared'

// ── Constants ────────────────────────────────────────────────────────────────

const RESOURCES = Object.keys(PERMISSIONS_BY_RESOURCE) as PermissionResource[]
const ACTIONS = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXECUTE', 'EXPORT', 'ADMIN'] as const

const ACTION_LABELS: Record<string, string> = {
  VIEW: 'VER',
  CREATE: 'CRIAR',
  EDIT: 'EDITAR',
  DELETE: 'DELETAR',
  EXECUTE: 'EXECUTAR',
  EXPORT: 'EXPORTAR',
  ADMIN: 'ADMIN',
}

const RESOURCE_LABELS: Record<string, string> = {
  DASHBOARD: 'Dashboard',
  RELATORIOS: 'Relatórios',
  EXEMPLO: 'Exemplo',
  ETL: 'ETL',
  CONFIGURACOES: 'Configurações',
  OBSERVABILIDADE: 'Observabilidade',
  DOCUMENTACAO: 'Documentação',
  LGPD: 'LGPD',
  ADMIN: 'Admin',
  USUARIOS: 'Usuários',
  PERFIS: 'Perfis',
  ENTIDADES: 'Entidades',
  AUDITORIA: 'Auditoria',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function permKey(resource: PermissionResource, action: string): Permission {
  return `${resource}.${action}` as Permission
}

function isPermissionValid(resource: PermissionResource, action: string): boolean {
  const perms = PERMISSIONS_BY_RESOURCE[resource] as string[]
  return perms.includes(permKey(resource, action))
}

// ── Create role modal ─────────────────────────────────────────────────────────

function CreateRoleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const create = useCreateRole()
  const { error: toastError } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const role = await create.mutateAsync({ name, display_name: displayName, description })
      onCreated(role.id)
      onClose()
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao criar role')
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Nova Role" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="role-name"
            className="block text-xs font-medium text-[var(--text-muted)] mb-1"
          >
            Nome (slug) <span className="text-rose-400">*</span>
          </label>
          <input
            id="role-name"
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
            placeholder="EX: SUPERVISOR"
            className="w-full px-3 py-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]/50 placeholder:text-[var(--text-muted)]"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">Letras maiúsculas, números e _</p>
        </div>
        <div>
          <label
            htmlFor="role-display-name"
            className="block text-xs font-medium text-[var(--text-muted)] mb-1"
          >
            Nome de exibição <span className="text-rose-400">*</span>
          </label>
          <input
            id="role-display-name"
            type="text"
            required
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Ex: Supervisor"
            className="w-full px-3 py-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]/50 placeholder:text-[var(--text-muted)]"
          />
        </div>
        <div>
          <label
            htmlFor="role-description"
            className="block text-xs font-medium text-[var(--text-muted)] mb-1"
          >
            Descrição
          </label>
          <input
            id="role-description"
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descrição opcional"
            className="w-full px-3 py-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]/50 placeholder:text-[var(--text-muted)]"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--glass-border)] text-sm text-[var(--text-secondary)] hover:bg-white/[0.03] transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!name || !displayName || create.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-medium disabled:opacity-60 transition-all"
          >
            <Plus size={14} aria-hidden="true" /> Criar
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ── Permission matrix ─────────────────────────────────────────────────────────

function PermissionMatrix({
  role,
  onPermissionToggle,
  saving,
}: {
  role: RoleDefinition
  onPermissionToggle: (perm: Permission) => void
  saving: boolean
}) {
  const perms = new Set(role.permissions)
  const isSystem = role.is_system

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left select-none">
        <caption className="sr-only">Matriz de permissões por recurso</caption>
        <thead>
          <tr className="border-b border-[var(--glass-border)]">
            <th className="py-3 pr-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider min-w-[140px]">
              Recurso
            </th>
            {ACTIONS.map(action => (
              <th
                key={action}
                className="py-3 px-2 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider"
              >
                {ACTION_LABELS[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RESOURCES.map(resource => (
            <tr
              key={resource}
              className="border-b border-[var(--glass-border)]/40 hover:bg-white/[0.015] transition-colors"
            >
              <td className="py-3 pr-4 text-sm font-medium text-[var(--text-primary)]">
                {RESOURCE_LABELS[resource] ?? resource}
              </td>
              {ACTIONS.map(action => {
                const perm = permKey(resource, action)
                const valid = isPermissionValid(resource, action)
                const checked = perms.has(perm)

                if (!valid) {
                  return (
                    <td key={action} className="py-3 px-2 text-center">
                      <span className="text-white/10">—</span>
                    </td>
                  )
                }

                return (
                  <td key={action} className="py-3 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => !isSystem && !saving && onPermissionToggle(perm)}
                      aria-label={`${checked ? 'Remover' : 'Adicionar'} ${perm}`}
                      aria-pressed={checked}
                      disabled={isSystem || saving}
                      className={[
                        'w-5 h-5 rounded flex items-center justify-center mx-auto transition-all',
                        isSystem ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
                        checked
                          ? 'bg-[var(--brand-primary)] text-white'
                          : 'border border-[var(--glass-border)] bg-[var(--glass-bg)] text-transparent hover:border-[var(--brand-primary)]/40',
                      ].join(' ')}
                    >
                      {checked && <span className="text-[10px] font-bold leading-none">✓</span>}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {isSystem && (
        <p className="flex items-center gap-1.5 mt-4 text-xs text-[var(--text-muted)]">
          <Lock size={12} aria-hidden="true" /> Roles do sistema têm permissões fixas. Apenas nome e
          descrição são editáveis.
        </p>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const { data, isLoading } = useRoles()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const updateRole = useUpdateRole(selectedId ?? '')
  const deleteRole = useDeleteRole()
  const { success, error: toastError } = useToast()

  const roles = data?.items ?? []
  const selected = roles.find(r => r.id === selectedId) ?? roles[0] ?? null
  const effectiveSelected = selectedId ? selected : (roles[0] ?? null)

  async function handlePermissionToggle(perm: Permission) {
    if (!effectiveSelected || effectiveSelected.is_system) return
    const current = new Set(effectiveSelected.permissions)
    if (current.has(perm)) current.delete(perm)
    else current.add(perm)

    setSaving(true)
    try {
      await updateRole.mutateAsync({ permissions: Array.from(current) })
      success('Permissão atualizada')
    } catch {
      toastError('Erro ao salvar permissão')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteRole(role: RoleDefinition) {
    if (role.is_system) {
      toastError('Roles do sistema não podem ser removidas')
      return
    }
    try {
      await deleteRole.mutateAsync(role.id)
      success('Role removida')
      setSelectedId(null)
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao remover role')
    }
  }

  return (
    <main className="page-enter ambient-gradient max-w-6xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Link
          href="/admin"
          className="p-1.5 rounded-xl hover:bg-white/[0.03] transition-colors"
          aria-label="Voltar"
        >
          <ChevronLeft size={20} className="text-[var(--text-muted)]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Perfis e Roles</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Gerencie roles e permissões granulares
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--glass-border)] text-sm text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition-all"
        >
          <Plus size={14} aria-hidden="true" /> Nova role
        </button>
      </div>

      <div className="relative z-10 flex gap-5">
        {/* Sidebar — lista de roles */}
        <aside className="w-56 shrink-0 space-y-1">
          {isLoading && (
            <div className="glass-panel px-3 py-2 text-xs text-[var(--text-muted)]">
              Carregando...
            </div>
          )}
          {roles.map(role => {
            const isActive = effectiveSelected?.id === role.id
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedId(role.id)}
                className={[
                  'w-full text-left px-3 py-2.5 rounded-xl transition-all group flex items-center gap-2',
                  isActive
                    ? 'bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20'
                    : 'hover:bg-white/[0.03] border border-transparent',
                ].join(' ')}
              >
                {role.is_system ? (
                  <ShieldCheck
                    size={14}
                    className={
                      isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-muted)]'
                    }
                  />
                ) : (
                  <Shield
                    size={14}
                    className={
                      isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-muted)]'
                    }
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)]'}`}
                  >
                    {role.display_name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] font-mono truncate">{role.name}</p>
                </div>
              </button>
            )
          })}
        </aside>

        {/* Matrix panel */}
        {effectiveSelected ? (
          <div className="flex-1 glass-panel p-6">
            {/* Role header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    {effectiveSelected.display_name}
                  </h2>
                  {effectiveSelected.is_system && (
                    <span className="px-2 py-0.5 rounded text-xs bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                      Sistema
                    </span>
                  )}
                </div>
                {effectiveSelected.description && (
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">
                    {effectiveSelected.description}
                  </p>
                )}
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {effectiveSelected.permissions.length} permissão(ões)
                  {effectiveSelected.user_count !== undefined &&
                    ` · ${effectiveSelected.user_count} usuário(s)`}
                </p>
              </div>
              {!effectiveSelected.is_system && (
                <button
                  type="button"
                  onClick={() => handleDeleteRole(effectiveSelected)}
                  aria-label="Remover role"
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            <PermissionMatrix
              role={effectiveSelected}
              onPermissionToggle={handlePermissionToggle}
              saving={saving}
            />
          </div>
        ) : (
          <div className="flex-1 glass-panel p-12 flex items-center justify-center">
            <p className="text-sm text-[var(--text-muted)]">
              {isLoading ? 'Carregando roles...' : 'Nenhuma role encontrada'}
            </p>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateRoleModal onClose={() => setShowCreate(false)} onCreated={id => setSelectedId(id)} />
      )}
    </main>
  )
}
