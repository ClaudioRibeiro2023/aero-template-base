'use client'

import { supabase } from '@template/shared/supabase'
import { useState, useEffect } from 'react'
import { Mail, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'

// ============================================================================
// Subcomponents
// ============================================================================

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

/** Animated typing cursor effect */
function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, 60)
    return () => clearInterval(interval)
  }, [text])

  useEffect(() => {
    const blink = setInterval(() => setShowCursor(v => !v), 530)
    return () => clearInterval(blink)
  }, [])

  return (
    <span>
      {displayed}
      <span
        className={`inline-block w-[2px] h-[1.1em] bg-white/60 ml-0.5 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`}
        style={{ transition: 'opacity 0.1s' }}
      />
    </span>
  )
}

/** Floating status ticker bar */
function StatusTicker() {
  const items = [
    '◈ SISTEMA ONLINE',
    'CONEXÃO SEGURA',
    'CRIPTOGRAFIA AES-256-GCM',
    `ÚLTIMA SYNC: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}UTC`,
    `© ${new Date().getFullYear()}`,
    'TLS 1.3 VERIFIED',
    'UPTIME 99.97%',
  ]
  const text = items.join(' · ')
  return (
    <div className="absolute top-0 left-0 right-0 h-6 overflow-hidden z-20 bg-black/30 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center h-full animate-ticker whitespace-nowrap">
        <span className="text-[10px] tracking-[0.15em] text-emerald-400/70 font-mono uppercase px-4">
          {text} · {text}
        </span>
      </div>
    </div>
  )
}

/** Floating dots (simulated drone/node indicators) */
function FloatingDots() {
  const dots = [
    { top: '12%', left: '8%', delay: '0s', duration: '25s', color: '#0E8C6B' },
    { top: '72%', left: '82%', delay: '3s', duration: '30s', color: '#2980B9' },
    { top: '10%', left: '75%', delay: '6s', duration: '22s', color: '#0E8C6B' },
    { top: '78%', left: '5%', delay: '2s', duration: '28s', color: '#2980B9' },
    { top: '50%', left: '90%', delay: '4s', duration: '20s', color: '#0E8C6B' },
  ]
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {dots.map((dot, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            top: dot.top,
            left: dot.left,
            animationDelay: dot.delay,
            animationDuration: dot.duration,
          }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse shadow-lg"
            style={{
              backgroundColor: dot.color,
              boxShadow: `0 0 8px ${dot.color}60`,
            }}
          />
          {/* Connecting line */}
          <div
            className="absolute top-1/2 left-1/2 w-16 h-px opacity-20"
            style={{
              background: `linear-gradient(90deg, ${dot.color}, transparent)`,
              transform: `rotate(${i * 72}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  )
}

/** System info overlay (telemetry-style) */
function SystemOverlay() {
  return (
    <div className="absolute bottom-4 left-4 z-10 pointer-events-none hidden md:block">
      <div className="font-mono text-[9px] text-white/20 space-y-0.5 leading-tight">
        <div>SYS · PLATFORM</div>
        <div>ENC AES-256-GCM</div>
        <div>TLS 1.3 · VERIFIED</div>
        <div>UPTIME 99.97%</div>
        <div>v2.0.0 · STABLE</div>
      </div>
    </div>
  )
}

// ============================================================================
// Floating Input (label floats up on focus/filled)
// ============================================================================

function FloatingInput({
  id,
  type,
  label,
  value,
  onChange,
  required,
}: {
  id: string
  type: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}) {
  const hasValue = value.length > 0
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full px-3 pt-5 pb-2 bg-white/[0.06] border border-white/10 rounded-lg text-white text-sm placeholder-transparent transition-all focus:outline-none focus:ring-2 focus:ring-[#2980B9]/40 focus:border-[#2980B9]/60 backdrop-blur-sm"
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
}

// ============================================================================
// Main Login Page
// ============================================================================

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
  const appInitial = appName.charAt(0).toUpperCase()

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
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated mesh background */}
      <div className="absolute inset-0 animated-mesh" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating dots */}
      <FloatingDots />

      {/* Status ticker */}
      <StatusTicker />

      {/* System telemetry overlay */}
      <SystemOverlay />

      {/* Main content */}
      <div className="relative z-20 w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-6 animate-fade-in-up">
          <div className="inline-block mb-4">
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
          style={{
            backgroundColor: 'rgba(5, 15, 35, 0.85)',
            animationDelay: '0.15s',
          }}
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
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <FloatingInput
                id="email"
                type="email"
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <FloatingInput
                id="password"
                type="password"
                label="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
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
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <FloatingInput
                id="magic-email"
                type="email"
                label="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg text-white text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #2980B9, #0E8C6B)' }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {loading ? 'Enviando...' : 'Enviar link de acesso'}
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

      {/* CSS Animations */}
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
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </main>
  )
}
