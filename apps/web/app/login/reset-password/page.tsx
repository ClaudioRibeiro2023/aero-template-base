'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabasePublicAuthClient } from '@/lib/supabase-browser'
import { Lock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const supabase = createSupabasePublicAuthClient()

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (password !== confirm) {
      setError('As senhas não conferem.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.replace('/dashboard'), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c1929] via-[#0f2940] to-[#0c1929] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-[var(--brand-primary,#0087A8)]/10 mb-4">
              <Lock className="w-8 h-8 text-[var(--brand-primary,#0087A8)]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Redefinir senha</h1>
            <p className="text-white/50 text-sm mt-2">
              Digite sua nova senha para acessar a plataforma.
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white font-medium">Senha alterada com sucesso!</p>
              <p className="text-white/40 text-sm">Redirecionando para o dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle size={16} className="text-rose-400 flex-shrink-0" />
                  <p className="text-sm text-rose-300">{error}</p>
                </div>
              )}

              {/* New password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm text-white/60 font-medium">
                  Nova senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#0087A8)]/50 focus:border-[var(--brand-primary,#0087A8)]/50 transition-all"
                />
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="confirm" className="text-sm text-white/60 font-medium">
                  Confirmar senha
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#0087A8)]/50 focus:border-[var(--brand-primary,#0087A8)]/50 transition-all"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[var(--brand-primary,#0087A8)] text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          )}

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeft size={14} />
              Voltar ao login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/15 text-xs mt-6" suppressHydrationWarning>
          {appName} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
