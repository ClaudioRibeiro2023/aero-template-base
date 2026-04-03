'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useState, useMemo, forwardRef } from 'react'
import { Mail, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { LoginSchema, ResetPasswordSchema } from '@/schemas/auth'
import { GoogleIcon, TypingText } from './LoginVisualEffects'

type LoginFormData = z.infer<typeof LoginSchema>
type MagicLinkFormData = z.infer<typeof ResetPasswordSchema>

// ============================================================================
// Floating Input (label floats up on focus/filled)
// ============================================================================

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  currentValue?: string
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(function FloatingInput(
  { id, label, currentValue = '', className: _className, ...rest },
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

// ============================================================================
// Login Form Component
// ============================================================================

type AuthMode = 'password' | 'magic'

export interface LoginFormProps {
  appName: string
  logoUrl?: string
}

export function LoginForm({ appName, logoUrl }: LoginFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [socialLoading, setSocialLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [mode, setMode] = useState<AuthMode>('password')

  const appInitial = appName.charAt(0).toUpperCase()

  // ── Form: senha ──
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  })

  // ── Form: magic link ──
  const {
    register: registerMagic,
    handleSubmit: handleSubmitMagic,
    watch: watchMagic,
    formState: { errors: magicErrors, isSubmitting: isMagicSubmitting },
  } = useForm<MagicLinkFormData>({
    resolver: zodResolver(ResetPasswordSchema),
  })

  const onPasswordLogin = async (data: LoginFormData) => {
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
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
  }

  const onMagicLink = async (data: MagicLinkFormData) => {
    setMessage(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else {
      setMessage({ text: 'Link de acesso enviado! Verifique seu email.', type: 'success' })
    }
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

  const isLoading = isPasswordSubmitting || isMagicSubmitting || socialLoading

  return (
    <div className="relative z-10 w-full max-w-md px-4">
      {/* Logo & Title */}
      <div className="text-center mb-6 animate-fade-in-up">
        <div className="inline-block mb-4 logo-glitch">
          {logoUrl ? (
            <img src={logoUrl} alt={appName} className="h-16 w-auto object-contain mx-auto" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E7C7B] to-[#2980B9] flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-xl shadow-[#0E7C7B]/30">
              {appInitial}
            </div>
          )}
        </div>
        <p className="text-white/50 text-sm">
          <TypingText text={appName} />
        </p>
      </div>

      {/* Login Card */}
      <div
        className="rounded-2xl backdrop-blur-2xl luminous-border animate-fade-in-up p-8"
        style={{ backgroundColor: 'rgba(5, 15, 35, 0.85)', animationDelay: '0.15s' }}
      >
        <h2 className="text-lg font-semibold text-white text-center mb-6">Bem-vindo de volta</h2>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full h-12 rounded-lg text-sm font-medium flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 border border-white/15 text-white/80 hover:bg-white/10 hover:border-white/25"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          <GoogleIcon />
          {socialLoading ? 'Conectando...' : 'Entrar com Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30 font-medium">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Forms */}
        {mode === 'password' ? (
          <form onSubmit={handleSubmitPassword(onPasswordLogin)} className="space-y-4">
            <div>
              <FloatingInput
                id="email"
                type="email"
                label="Email"
                currentValue={watchPassword('email') ?? ''}
                {...registerPassword('email')}
              />
              {passwordErrors.email && (
                <p className="text-xs text-red-400 mt-1" role="alert">
                  {passwordErrors.email.message}
                </p>
              )}
            </div>
            <div>
              <FloatingInput
                id="password"
                type="password"
                label="Senha"
                currentValue={watchPassword('password') ?? ''}
                {...registerPassword('password')}
              />
              {passwordErrors.password && (
                <p className="text-xs text-red-400 mt-1" role="alert">
                  {passwordErrors.password.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Link
                href="/login/forgot-password"
                className="text-xs text-[#2980B9] hover:text-[#2980B9]/80 transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg text-white text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #2980B9, #0E8C6B)' }}
            >
              {isPasswordSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isPasswordSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitMagic(onMagicLink)} className="space-y-4">
            <div>
              <FloatingInput
                id="magic-email"
                type="email"
                label="Email"
                currentValue={watchMagic('email') ?? ''}
                {...registerMagic('email')}
              />
              {magicErrors.email && (
                <p className="text-xs text-red-400 mt-1" role="alert">
                  {magicErrors.email.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-lg text-white text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #2980B9, #0E8C6B)' }}
            >
              {isMagicSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {isMagicSubmitting ? 'Enviando...' : 'Enviar link de acesso'}
            </button>
          </form>
        )}

        {/* Mode toggle */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'password' ? 'magic' : 'password')}
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            {mode === 'password' ? 'Usar link mágico' : 'Usar senha'}
          </button>
        </div>

        {/* Messages */}
        {message && (
          <p
            className={`text-sm text-center mt-4 ${message.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
            role="alert"
          >
            {message.text}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <p className="text-white/20 text-xs">
          {appName} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
