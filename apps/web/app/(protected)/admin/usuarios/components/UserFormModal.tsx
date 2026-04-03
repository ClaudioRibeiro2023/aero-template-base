'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'
import { useRoles } from '@/hooks/useRoles'
import { Modal } from '@template/design-system'
import type { Profile } from '@/hooks/useUsers'

type ModalMode = 'create' | 'edit' | null

export interface UserModalData {
  display_name: string
  email: string
  role: string
  is_active: boolean
}

export interface UserFormModalProps {
  mode: ModalMode
  user: Profile | null
  onClose: () => void
  onSave: (data: UserModalData) => void
}

export function UserFormModal({ mode, user, onClose, onSave }: UserFormModalProps) {
  const { data: rolesData } = useRoles()
  const availableRoles = rolesData?.items ?? []
  const [displayName, setDisplayName] = useState(user?.display_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [role, setRole] = useState<string>(user?.role || 'VIEWER')
  const [isActive, setIsActive] = useState(user?.is_active ?? true)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ display_name: displayName, email, role, is_active: isActive })
    } catch {
      // Error handling feito pelo React Query
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={!!mode}
      onClose={onClose}
      title={mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            {availableRoles.length > 0 ? (
              availableRoles.map(r => (
                <option key={r.id} value={r.name}>
                  {r.display_name}
                  {r.description ? ` — ${r.description}` : ''}
                </option>
              ))
            ) : (
              <>
                <option value="VIEWER">Viewer — somente leitura</option>
                <option value="OPERADOR">Operador — leitura e operação</option>
                <option value="GESTOR">Gestor — gestão de módulos</option>
                <option value="ADMIN">Admin — acesso total</option>
              </>
            )}
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
          className="flex gap-3 pt-4 justify-end"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-zinc-400 transition-colors duration-150 hover:bg-white/[0.04]"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity duration-150 disabled:opacity-50 hover:opacity-90"
            style={{ background: '#00b4d8' }}
          >
            <Save size={14} aria-hidden="true" />
            {saving ? 'Salvando...' : mode === 'create' ? 'Criar usuário' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
