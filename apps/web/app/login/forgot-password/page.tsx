'use client'

import { supabase } from '@template/shared/supabase'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'

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

    if (authError) setError(authError.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1B365D] to-[#142847] flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(14, 124, 123, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(56, 189, 248, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 90%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">{appName}</h1>
          <p className="text-white/50 text-sm mt-1">Recuperar senha</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-6">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-sm text-slate-600">
                Se este email estiver cadastrado, você receberá as instruções em breve.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1B365D] hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@empresa.com"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D]"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#1B365D] hover:bg-[#142847] text-white text-sm font-medium shadow-sm disabled:opacity-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/40 focus:ring-offset-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {loading ? 'Enviando...' : 'Enviar instruções'}
              </button>

              <div className="text-center pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-white/25 text-xs mt-6">
          {appName} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}
