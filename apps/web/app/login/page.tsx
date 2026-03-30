'use client'

import { supabase } from '@template/shared/supabase'
import { useState } from 'react'
import { Mail, Lock, Loader2 } from 'lucide-react'

// Google "G" SVG icon — inline para zero dependências
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18">
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

type AuthMode = 'password' | 'magic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [mode, setMode] = useState<AuthMode>('password')

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform'
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage({
        text:
          error.message === 'Invalid login credentials'
            ? 'Email ou senha incorretos'
            : error.message,
        type: 'error',
      })
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else {
      setMessage({ text: 'Link de acesso enviado! Verifique seu email.', type: 'success' })
    }
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setSocialLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setMessage({ text: error.message, type: 'error' })
      setSocialLoading(false)
    }
  }

  const isLoading = loading || socialLoading

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1B365D] to-[#142847] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle gradient mesh */}
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
        {/* Logo & Title */}
        <div className="text-center mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt={appName} className="h-10 w-auto object-contain mx-auto" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary,#0E7C7B)] flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg shadow-[var(--brand-primary,#0E7C7B)]/30">
              {appName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold text-white mt-4">{appName}</h1>
          <p className="text-white/50 text-sm mt-1">Entre com seu email corporativo</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-6 space-y-5">
          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all duration-150 shadow-sm"
          >
            <GoogleIcon />
            {socialLoading ? 'Conectando...' : 'Entrar com Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Auth Mode Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setMode('password')}
              className={`flex-1 pb-2.5 text-sm font-medium border-b-2 transition-colors ${
                mode === 'password'
                  ? 'border-[#1B365D] text-[#1B365D]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Senha
            </button>
            <button
              onClick={() => setMode('magic')}
              className={`flex-1 pb-2.5 text-sm font-medium border-b-2 transition-colors ${
                mode === 'magic'
                  ? 'border-[#1B365D] text-[#1B365D]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Link Mágico
            </button>
          </div>

          {/* Password Form */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
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
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D]"
                />
              </div>
              <div className="flex justify-end">
                <a
                  href="/login/forgot-password"
                  className="text-xs text-[#1B365D] hover:underline font-medium"
                >
                  Esqueci minha senha
                </a>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#1B365D] hover:bg-[#142847] text-white text-sm font-medium shadow-sm disabled:opacity-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/40 focus:ring-offset-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* Magic Link Form */}
          {mode === 'magic' && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="magic-email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="magic-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@empresa.com"
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B365D]/30 focus:border-[#1B365D]"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#1B365D] hover:bg-[#142847] text-white text-sm font-medium shadow-sm disabled:opacity-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/40 focus:ring-offset-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {loading ? 'Enviando...' : 'Enviar link de acesso'}
              </button>
            </form>
          )}

          {/* Messages */}
          {message && (
            <p
              className={`text-sm text-center ${message.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}
              role="alert"
            >
              {message.text}
            </p>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/25 text-xs mt-6">
          {appName} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  )
}
