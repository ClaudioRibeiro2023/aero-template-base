'use client'

import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { Save, Camera, Loader2 } from 'lucide-react'
import { useToast } from '@template/design-system'
import { useFormDirty } from '@/hooks/useFormDirty'

export default function ProfilePage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const { success, error: toastError } = useToast()
  const { isDirty, markDirty, markClean } = useFormDirty()

  // Carregar dados reais do perfil no mount
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    async function loadProfile() {
      try {
        const res = await fetch(`/api/users/${user!.id}`)
        if (res.ok) {
          const json = await res.json()
          const profile = json.data || json
          setDisplayName(profile.display_name || profile.full_name || user!.name || '')
          setBio(profile.bio || '')
        }
      } catch {
        // Fallback — usar dados do auth context
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [user])

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
    if (!user?.id) return
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, bio }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Erro ao salvar perfil')
      }
      markClean()
      success('Perfil atualizado com sucesso')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="page-enter ambient-gradient max-w-2xl mx-auto p-4 sm:p-8 space-y-6">
      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Meu Perfil</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Gerencie suas informacoes pessoais
        </p>
      </div>

      {/* Avatar Card */}
      <div className="relative z-10 glass-panel p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[var(--brand-primary)]/15 backdrop-blur-sm flex items-center justify-center text-[var(--brand-primary)] text-2xl font-bold border border-[var(--brand-primary)]/20">
              {initials}
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--brand-primary)] flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
              title="Alterar foto (em breve)"
              aria-label="Alterar foto"
              style={{ boxShadow: '0 0 12px var(--glow-brand)' }}
            >
              <Camera size={13} aria-hidden="true" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-[var(--text-primary)]">{user?.name || 'Usuario'}</p>
            <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
            <div className="flex gap-1.5 mt-2">
              {user?.roles?.map(role => (
                <span
                  key={role}
                  className="px-2.5 py-0.5 text-xs rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-medium backdrop-blur-sm border border-[var(--brand-primary)]/20"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      {loading ? (
        <div className="relative z-10 glass-panel p-6 flex items-center justify-center gap-2 text-[var(--text-secondary)]">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Carregando perfil...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="relative z-10 glass-panel p-6 space-y-5">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Nome de exibicao
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={e => {
                setDisplayName(e.target.value)
                markDirty()
              }}
              aria-required="true"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm text-[var(--text-primary)] transition-all duration-200 focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/20"
              style={{ boxShadow: 'none' }}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              readOnly
              aria-describedby="email-helper"
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm text-[var(--text-muted)] cursor-not-allowed"
            />
            <p id="email-helper" className="text-xs text-[var(--text-muted)] mt-1.5">
              O email nao pode ser alterado aqui
            </p>
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
            >
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
              placeholder="Conte um pouco sobre voce..."
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm text-sm text-[var(--text-primary)] resize-none transition-all duration-200 focus:outline-none focus:border-[var(--brand-primary)]/50 focus:ring-1 focus:ring-[var(--brand-primary)]/20 placeholder:text-[var(--text-muted)]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {isDirty && (
              <span className="text-xs text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Alteracoes nao salvas
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
              style={{ boxShadow: '0 0 16px var(--glow-brand)' }}
            >
              <Save size={15} aria-hidden="true" />
              {saving ? 'Salvando...' : 'Salvar alteracoes'}
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
