'use client'

import { supabase } from '@template/shared/supabase'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Em demo mode não há Supabase real — apenas simular envio
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      setTimeout(() => {
        setSent(true)
        setLoading(false)
      }, 800)
      return
    }

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/reset-password`,
    })

    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#0f172a' }}
    >
      {/* Gradient mesh background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
          radial-gradient(ellipse at 20% 50%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)
        `,
        }}
      />
      <div className="relative z-10 w-full max-w-md p-8 rounded-xl bg-[#1e293b] border border-slate-700/50 shadow-xl shadow-black/20">
        <h1 className="text-2xl font-bold text-center mb-2 text-white">{appName}</h1>
        <p className="text-sm text-center text-slate-400 mb-6">Recuperar senha</p>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-900/20 flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm text-slate-300">
              Se este email estiver cadastrado, você receberá as instruções em breve.
            </p>
            <Link
              href="/login"
              className="inline-block text-sm text-[var(--brand-primary)] hover:underline"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-slate-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-[var(--brand-primary)] text-white font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar instruções'}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-slate-400 hover:text-slate-300">
                ← Voltar ao login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
