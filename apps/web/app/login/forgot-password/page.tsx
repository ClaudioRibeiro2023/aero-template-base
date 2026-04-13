'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { ResetPasswordSchema } from '@/schemas/auth'

type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
  })

  const emailValue = watch('email') ?? ''

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null)

    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      await new Promise(r => setTimeout(r, 800))
      setSent(true)
      return
    }

    const { error: authError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/login/reset-password`,
    })
    if (authError) setServerError(authError.message)
    else setSent(true)
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated mesh background */}
      <div className="absolute inset-0 animated-mesh" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-20 w-full max-w-sm">
        <div className="text-center mb-6 animate-fade-in-up">
          <h1 className="text-xl font-bold text-white">{appName}</h1>
          <p className="text-white/40 text-sm mt-1">Recuperar senha</p>
        </div>

        <div
          className="rounded-2xl backdrop-blur-2xl luminous-border animate-fade-in-up p-8"
          style={{ backgroundColor: 'rgba(5, 15, 35, 0.85)', animationDelay: '0.15s' }}
        >
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'rgba(14,140,107,0.15)' }}
              >
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-sm text-white/60">
                Se este email estiver cadastrado, você receberá as instruções em breve.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2980B9] hover:text-[#2980B9]/80 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder=" "
                    className="peer w-full px-3 pt-5 pb-2 bg-white/[0.06] border border-white/10 rounded-lg text-white text-sm placeholder-transparent transition-all focus:outline-none focus:ring-2 focus:ring-[#2980B9]/40 focus:border-[#2980B9]/60 backdrop-blur-sm"
                    {...register('email')}
                  />
                  <label
                    htmlFor="email"
                    className={`absolute left-3 transition-all duration-200 pointer-events-none text-slate-400 ${
                      emailValue.length > 0
                        ? 'top-1.5 text-[10px] text-[#2980B9]'
                        : 'top-1/2 -translate-y-1/2 text-sm peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:translate-y-0 peer-focus:text-[#2980B9]'
                    }`}
                  >
                    Email
                  </label>
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-red-400 text-center" role="alert">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-lg text-white text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #2980B9, #0E8C6B)' }}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
              </button>

              <div className="text-center pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white/80 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </div>

        <p
          className="text-center text-white/15 text-xs mt-6 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          {appName} &copy; 2026
        </p>
      </div>

      <style jsx>{`
        .animated-mesh {
          background: linear-gradient(-45deg, #0c2340, #163b5c, #0e8c6b, #0c2340, #1a4a73);
          background-size: 400% 400%;
          animation: meshShift 15s ease infinite;
        }
        @keyframes meshShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .luminous-border {
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition:
            border-color 0.3s,
            box-shadow 0.3s;
          box-shadow:
            0 8px 40px rgba(0, 0, 0, 0.3),
            0 0 40px rgba(41, 128, 185, 0.1);
        }
        .luminous-border:hover {
          border-color: rgba(41, 128, 185, 0.4);
          box-shadow:
            0 8px 40px rgba(0, 0, 0, 0.3),
            0 0 20px rgba(41, 128, 185, 0.15);
        }
      `}</style>
    </main>
  )
}
