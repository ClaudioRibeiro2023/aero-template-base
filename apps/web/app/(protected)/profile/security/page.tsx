'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useState, useMemo, useCallback, type FormEvent } from 'react'
import { Shield, Smartphone, ChevronLeft, Loader2, CheckCircle2, XCircle, Lock } from 'lucide-react'
import Link from 'next/link'

type MfaStep = 'idle' | 'enrolling' | 'verifying' | 'enabled'

function PasswordUpdateForm({
  supabase,
}: {
  supabase: ReturnType<typeof createSupabaseBrowserClient>
}) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setError(null)
      setSuccess(false)

      if (!currentPassword) {
        setError('Informe a senha atual.')
        return
      }
      if (newPassword.length < 8) {
        setError('A nova senha deve ter pelo menos 8 caracteres.')
        return
      }
      if (newPassword !== confirmPassword) {
        setError('As senhas nao coincidem.')
        return
      }

      setLoading(true)
      try {
        // Re-authenticate with current password
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user?.email) {
          setError('Nao foi possivel identificar o usuario.')
          return
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        })
        if (signInError) {
          setError('Senha atual incorreta.')
          return
        }

        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
        if (updateError) {
          setError(updateError.message)
          return
        }

        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } finally {
        setLoading(false)
      }
    },
    [supabase, currentPassword, newPassword, confirmPassword]
  )

  const inputClass =
    'w-full h-11 px-4 bg-white/[0.06] border border-white/10 rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#2980B9]/40'

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
          <Lock className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Alterar Senha</h2>
          <p className="text-sm text-white/50">Atualize a senha da sua conta</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="current-password" className="block text-sm text-white/60 mb-1.5">
            Senha atual
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Digite sua senha atual"
            className={inputClass}
            autoComplete="current-password"
          />
        </div>
        <div>
          <label htmlFor="new-password" className="block text-sm text-white/60 mb-1.5">
            Nova senha
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Minimo 8 caracteres"
            className={inputClass}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm text-white/60 mb-1.5">
            Confirmar nova senha
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repita a nova senha"
            className={inputClass}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 text-center" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-emerald-400 text-center" role="status">
            Senha alterada com sucesso!
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #2980B9, #0E8C6B)' }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Alterar senha
        </button>
      </form>
    </div>
  )
}

export default function SecurityPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [step, setStep] = useState<MfaStep>('idle')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEnroll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      })
      if (enrollError) {
        setError(enrollError.message)
        return
      }
      if (data) {
        setQrCode(data.totp.qr_code)
        setFactorId(data.id)
        setStep('verifying')
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const handleVerify = useCallback(async () => {
    if (!factorId || verifyCode.length !== 6) return
    setLoading(true)
    setError(null)
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })
      if (challengeError) {
        setError(challengeError.message)
        return
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode,
      })
      if (verifyError) {
        setError(verifyError.message)
        return
      }
      setStep('enabled')
    } finally {
      setLoading(false)
    }
  }, [supabase, factorId, verifyCode])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar ao perfil
      </Link>

      <PasswordUpdateForm supabase={supabase} />

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Autenticacao em Dois Fatores</h1>
            <p className="text-sm text-white/50">
              Adicione uma camada extra de seguranca a sua conta
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-white/[0.04] border border-white/10">
          {step === 'enabled' ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">MFA ativado</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-white/30" />
              <span className="text-sm text-white/50">MFA desativado</span>
            </>
          )}
        </div>

        {/* Step: Idle */}
        {step === 'idle' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-white/[0.03] border border-white/10">
              <Smartphone className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div className="text-sm text-white/60">
                <p className="mb-1 text-white/80 font-medium">Aplicativo autenticador (TOTP)</p>
                <p>
                  Use um aplicativo como Google Authenticator, Authy ou 1Password para gerar codigos
                  de verificacao temporarios.
                </p>
              </div>
            </div>
            <button
              onClick={handleEnroll}
              disabled={loading}
              className="w-full h-11 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #2980B9, #0E8C6B)' }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              Ativar MFA
            </button>
          </div>
        )}

        {/* Step: Verifying — show QR + code input */}
        {step === 'verifying' && (
          <div className="space-y-5">
            <p className="text-sm text-white/60">
              Escaneie o QR code abaixo com seu aplicativo autenticador e insira o codigo de 6
              digitos.
            </p>
            {qrCode && (
              <div className="flex justify-center p-4 rounded-lg bg-white">
                <img src={qrCode} alt="QR Code MFA" className="w-48 h-48" />
              </div>
            )}
            <div>
              <label htmlFor="totp-code" className="block text-sm text-white/60 mb-2">
                Codigo de verificacao
              </label>
              <input
                id="totp-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full h-12 px-4 bg-white/[0.06] border border-white/10 rounded-lg text-white text-center text-2xl tracking-[0.5em] font-mono placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#2980B9]/40"
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || verifyCode.length !== 6}
              className="w-full h-11 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #2980B9, #0E8C6B)' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Verificar e ativar
            </button>
          </div>
        )}

        {/* Step: Enabled */}
        {step === 'enabled' && (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-white/80 font-medium">MFA ativado com sucesso!</p>
            <p className="text-sm text-white/50 mt-1">
              Sua conta agora esta protegida com autenticacao em dois fatores.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 mt-4 text-center" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
