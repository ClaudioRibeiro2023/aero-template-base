'use client'

import { supabase } from '@template/shared/supabase'
import { useState } from 'react'

// Google "G" SVG icon — inline para zero dependências
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform'
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      const msg =
        authError.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : authError.message
      setError(msg)
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setSocialLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setSocialLoading(false)
    }
    // Se não houver erro, o browser será redirecionado automaticamente pelo Supabase
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
        <div className="flex flex-col items-center mb-6 gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={appName} className="h-10 w-auto object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center text-white font-bold text-lg">
              {appName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold text-center text-white">{appName}</h1>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          disabled={socialLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-slate-600 bg-slate-700/50 text-sm font-medium text-slate-200 hover:bg-slate-600/50 hover:border-slate-500 disabled:opacity-50 transition-colors"
        >
          <GoogleIcon />
          {socialLoading ? 'Conectando...' : 'Entrar com Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-600/50" />
          <span className="text-xs text-slate-400">ou</span>
          <div className="flex-1 h-px bg-slate-600/50" />
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleLogin} className="space-y-4">
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
              className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-slate-200">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white placeholder-slate-400 focus:border-[var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <a
              href="/login/forgot-password"
              className="text-xs text-[var(--brand-primary)] hover:underline"
            >
              Esqueci minha senha
            </a>
          </div>

          <button
            type="submit"
            disabled={loading || socialLoading}
            className="w-full py-2 px-4 rounded-lg bg-[var(--brand-primary)] text-white font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
