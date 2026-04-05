'use client'

import { useState, useMemo, forwardRef } from 'react'
import { Mail, Loader2, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { SignupSchema } from '@/schemas/auth'
import type { z } from 'zod'
import { GoogleIcon, TypingText } from '../../login/components/LoginVisualEffects'

type SignupData = z.infer<typeof SignupSchema>

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  currentValue?: string
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(function FloatingInput(
  { id, label, currentValue = '', ...rest },
  ref
) {
  const hasValue = currentValue.length > 0
  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        placeholder=" "
        className="peer w-full px-3 pt-5 pb-2 bg-white/[0.06] border border-white/10 rounded-lg text-white text-sm placeholder-transparent transition-all focus:outline-none focus:ring-2 focus:ring-[#2980B9]/40 focus:border-[#2980B9]/60 backdrop-blur-sm"
        {...rest}
      />
      <label
        htmlFor={id}
        className={`absolute left-3 transition-all duration-200 pointer-events-none text-slate-400 ${
          hasValue
            ? 'top-1.5 text-[10px] text-[#2980B9]'
            : 'top-1/2 -translate-y-1/2 text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:translate-y-0 peer-focus:text-[#2980B9]'
        }`}
      >
        {label}
      </label>
    </div>
  )
})

export interface RegisterFormProps {
  appName: string
  logoUrl?: string
}

export function RegisterForm({ appName, logoUrl }: RegisterFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [socialLoading, setSocialLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [registered, setRegistered] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof SignupData, string>>>({})

  function handleChange(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setErrors({})

    const result = SignupSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.issues.forEach(issue => {
        const key = issue.path[0] as keyof SignupData
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setMessage({ text: error.message, type: 'error' })
      } else {
        setRegistered(true)
      }
    } catch {
      setMessage({ text: 'Erro inesperado. Tente novamente.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuthLogin(provider: 'google' | 'github') {
    setSocialLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setMessage({ text: error.message, type: 'error' })
      setSocialLoading(false)
    }
  }

  const isLoading = loading || socialLoading

  return (
    <div className="relative z-10 w-full max-w-md px-4">
      {/* Logo & Title */}
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="inline-block mb-5 logo-glitch">
          <img
            src={logoUrl || '/aero-logo.png'}
            alt={appName}
            className="h-14 w-auto object-contain mx-auto drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wide mb-1">
          <TypingText text={appName} />
        </h1>
        <div className="w-12 h-0.5 mx-auto rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {/* Card */}
      <div
        className="rounded-2xl backdrop-blur-2xl luminous-border animate-fade-in-up p-8"
        style={{ backgroundColor: 'rgba(5, 15, 35, 0.85)', animationDelay: '0.15s' }}
      >
        <h2 className="text-lg font-semibold text-white text-center mb-6">Criar conta</h2>

        {registered ? (
          <div className="text-center py-4">
            <Mail className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-white/80 text-sm mb-2">Conta criada com sucesso!</p>
            <p className="text-white/50 text-xs mb-4">
              Verifique seu email para confirmar o cadastro.
            </p>
            <Link
              href="/login"
              className="text-[#2980B9] hover:text-[#2980B9]/80 text-sm transition-colors"
            >
              Voltar para login
            </Link>
          </div>
        ) : (
          <>
            {/* OAuth */}
            <div className="space-y-3">
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
                className="w-full h-12 rounded-lg text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 border border-white/15 text-white/80 hover:bg-white/10 hover:border-white/25"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <GoogleIcon />
                {socialLoading ? 'Conectando...' : 'Registrar com Google'}
              </button>
              <button
                onClick={() => handleOAuthLogin('github')}
                disabled={isLoading}
                className="w-full h-12 rounded-lg text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 border border-white/15 text-white/90 hover:bg-white/10 hover:border-white/25"
                style={{ backgroundColor: 'rgba(30,30,30,0.6)' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {socialLoading ? 'Conectando...' : 'Registrar com GitHub'}
              </button>
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/30 font-medium">ou continue com</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <FloatingInput
                  id="name"
                  type="text"
                  label="Nome completo"
                  currentValue={form.name}
                  onChange={e => handleChange('name', e.currentTarget.value)}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <FloatingInput
                  id="email"
                  type="email"
                  label="Email"
                  currentValue={form.email}
                  onChange={e => handleChange('email', e.currentTarget.value)}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <FloatingInput
                  id="password"
                  type="password"
                  label="Senha (min. 8 caracteres)"
                  currentValue={form.password}
                  onChange={e => handleChange('password', e.currentTarget.value)}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg text-white text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #2980B9, #0E8C6B)' }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-xs text-white/40">Ja tem conta? </span>
              <Link
                href="/login"
                className="text-xs text-[#2980B9] hover:text-[#2980B9]/80 transition-colors"
              >
                Entrar
              </Link>
            </div>
          </>
        )}

        {message && !registered && (
          <p
            className={`text-sm text-center mt-4 ${message.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
            role="alert"
          >
            {message.text}
          </p>
        )}
      </div>

      <div className="text-center mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <p className="text-white/20 text-xs">
          {appName} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
