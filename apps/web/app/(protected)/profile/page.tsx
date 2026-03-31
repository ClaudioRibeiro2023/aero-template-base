'use client'

import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { Save, Camera } from 'lucide-react'
import { useToast } from '@template/design-system'
import { useFormDirty } from '@/hooks/useFormDirty'

export default function ProfilePage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const { success } = useToast()
  const { isDirty, markDirty, markClean } = useFormDirty()

  const initials = displayName
    ? displayName
        .split(' ')
        .map(p => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // Em produção: atualizar profiles no Supabase
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    markClean()
    success('Perfil atualizado com sucesso')
  }

  return (
    <main className="page-enter max-w-2xl mx-auto p-4 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Gerencie suas informações pessoais
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[var(--brand-primary)]/20 flex items-center justify-center text-[var(--brand-primary)] text-2xl font-bold">
            {initials}
          </div>
          <button
            type="button"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-white hover:opacity-90 shadow"
            title="Alterar foto (em breve)"
            aria-label="Alterar foto"
          >
            <Camera size={13} />
          </button>
        </div>
        <div>
          <p className="font-semibold">{user?.name || 'Usuário'}</p>
          <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
          <div className="flex gap-1.5 mt-1.5">
            {user?.roles?.map(role => (
              <span
                key={role}
                className="px-2 py-0.5 text-xs rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSave}
        className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 space-y-5"
      >
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium mb-1.5">
            Nome de exibição
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={e => {
              setDisplayName(e.target.value)
              markDirty()
            }}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user?.email || ''}
            readOnly
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm text-[var(--text-muted)] cursor-not-allowed"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            O email não pode ser alterado aqui
          </p>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1.5">
            Bio <span className="text-[var(--text-muted)] font-normal">(opcional)</span>
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={e => {
              setBio(e.target.value)
              markDirty()
            }}
            placeholder="Conte um pouco sobre você..."
            className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-base)] text-sm resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {isDirty && (
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Alterações não salvas
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            <Save size={15} />
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </main>
  )
}
