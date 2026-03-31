'use client'

import { supabase } from '@template/shared/supabase'
import { useState, useEffect, forwardRef } from 'react'
import { Mail, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { LoginSchema, ResetPasswordSchema } from '@/schemas/auth'

type LoginFormData = z.infer<typeof LoginSchema>
type MagicLinkFormData = z.infer<typeof ResetPasswordSchema>

// ============================================================================
// Subcomponents — Background Effects (matching aero-survey production)
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

/** Noise texture overlay */
function NoiseOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[3]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        opacity: 0.03,
      }}
    />
  )
}

/** Vignette overlay */
function VignetteOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[3]"
      style={{
        background: 'radial-gradient(transparent 50%, rgba(0,0,0,0.55) 100%)',
      }}
    />
  )
}

/** Animated scrolling grid */
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(41, 128, 185, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(41, 128, 185, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          animation: 'gridScroll 4s linear infinite',
        }}
      />
    </div>
  )
}

/** Status ticker bar */
function StatusTicker() {
  const items = [
    '◈ SISTEMA ONLINE',
    'CONEXÃO SEGURA',
    'CRIPTOGRAFIA AES-256-GCM',
    'DRONE FLEET ACTIVE: 5 UNITS',
    `ÚLTIMA SYNC: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}UTC`,
    `© ${new Date().getFullYear()}`,
    'TLS 1.3 VERIFIED',
    'UPTIME 99.97%',
  ]
  const text = items.join(' · ')
  return (
    <div className="absolute top-0 left-0 right-0 h-6 overflow-hidden pointer-events-none z-[4] bg-black/30 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center h-full status-bar-scroll whitespace-nowrap">
        <span className="text-[10px] tracking-[0.15em] text-emerald-400/70 font-mono uppercase px-4">
          {text} · {text} · {text}
        </span>
      </div>
    </div>
  )
}

/** 30 floating particles */
function Particles() {
  const particleData = [
    { size: 2, left: '13%', top: '7%', bg: '#2980B9', dur: 8, delay: 0 },
    { size: 4, left: '50%', top: '60%', bg: '#0E8C6B', dur: 10, delay: -0.7 },
    { size: 6, left: '87%', top: '13%', bg: 'rgba(255,255,255,0.4)', dur: 12, delay: -1.4 },
    { size: 2, left: '24%', top: '66%', bg: '#2980B9', dur: 14, delay: -2.1 },
    { size: 4, left: '61%', top: '19%', bg: '#0E8C6B', dur: 16, delay: -2.8 },
    { size: 6, left: '98%', top: '72%', bg: 'rgba(255,255,255,0.4)', dur: 8, delay: -3.5 },
    { size: 2, left: '35%', top: '25%', bg: '#2980B9', dur: 10, delay: -4.2 },
    { size: 4, left: '72%', top: '78%', bg: '#0E8C6B', dur: 12, delay: -4.9 },
    { size: 6, left: '9%', top: '31%', bg: 'rgba(255,255,255,0.4)', dur: 14, delay: -5.6 },
    { size: 2, left: '46%', top: '84%', bg: '#2980B9', dur: 16, delay: -6.3 },
    { size: 4, left: '83%', top: '37%', bg: '#0E8C6B', dur: 8, delay: -7 },
    { size: 6, left: '20%', top: '90%', bg: 'rgba(255,255,255,0.4)', dur: 10, delay: -7.7 },
    { size: 2, left: '57%', top: '43%', bg: '#2980B9', dur: 12, delay: -8.4 },
    { size: 4, left: '94%', top: '96%', bg: '#0E8C6B', dur: 14, delay: -9.1 },
    { size: 6, left: '31%', top: '49%', bg: 'rgba(255,255,255,0.4)', dur: 16, delay: -9.8 },
    { size: 2, left: '68%', top: '2%', bg: '#2980B9', dur: 8, delay: -10.5 },
    { size: 4, left: '5%', top: '55%', bg: '#0E8C6B', dur: 10, delay: -11.2 },
    { size: 6, left: '42%', top: '8%', bg: 'rgba(255,255,255,0.4)', dur: 12, delay: -11.9 },
    { size: 2, left: '79%', top: '61%', bg: '#2980B9', dur: 14, delay: -12.6 },
    { size: 4, left: '16%', top: '14%', bg: '#0E8C6B', dur: 16, delay: -13.3 },
    { size: 6, left: '53%', top: '67%', bg: 'rgba(255,255,255,0.4)', dur: 8, delay: -14 },
    { size: 2, left: '90%', top: '20%', bg: '#2980B9', dur: 10, delay: -14.7 },
    { size: 4, left: '27%', top: '73%', bg: '#0E8C6B', dur: 12, delay: -15.4 },
    { size: 6, left: '64%', top: '26%', bg: 'rgba(255,255,255,0.4)', dur: 14, delay: -16.1 },
    { size: 2, left: '1%', top: '79%', bg: '#2980B9', dur: 16, delay: -16.8 },
    { size: 4, left: '38%', top: '32%', bg: '#0E8C6B', dur: 8, delay: -17.5 },
    { size: 6, left: '75%', top: '85%', bg: 'rgba(255,255,255,0.4)', dur: 10, delay: -18.2 },
    { size: 2, left: '12%', top: '38%', bg: '#2980B9', dur: 12, delay: -18.9 },
    { size: 4, left: '49%', top: '91%', bg: '#0E8C6B', dur: 14, delay: -19.6 },
    { size: 6, left: '86%', top: '44%', bg: 'rgba(255,255,255,0.4)', dur: 16, delay: -20.3 },
  ]
  return (
    <>
      {particleData.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            background: p.bg,
            boxShadow: `${p.bg} 0px 0px ${6 + i * 0.3}px`,
            animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </>
  )
}

/** Orbit rings (3 concentric spinning rings + orbital dots) */
function OrbitRings() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {/* Outer ring */}
      <div
        className="w-[600px] h-[600px] rounded-full border border-white/[0.03]"
        style={{ animation: 'orbitSpin 30s linear infinite' }}
      />
      {/* Middle ring */}
      <div
        className="absolute inset-8 rounded-full border border-[#2980B9]/[0.06]"
        style={{ animation: 'orbitSpin 25s linear infinite reverse' }}
      />
      {/* Inner ring */}
      <div
        className="absolute inset-16 rounded-full border border-[#0E8C6B]/[0.05]"
        style={{ animation: 'orbitSpin 20s linear infinite' }}
      />
      {/* Orbital dot 1 */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#2980B9] shadow-[0_0_10px_#2980B9]"
        style={{ animation: 'orbitSpin 30s linear infinite' }}
      />
      {/* Orbital dot 2 */}
      <div
        className="absolute bottom-8 right-8 w-1.5 h-1.5 rounded-full bg-[#0E8C6B] shadow-[0_0_8px_#0E8C6B]"
        style={{ animation: 'orbitSpin 25s linear infinite reverse' }}
      />
    </div>
  )
}

/** Scan line effect */
function ScanLine() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2980B9]/20 to-transparent"
        style={{ animation: 'scanLine 6s ease-in-out infinite' }}
      />
    </div>
  )
}

/** Radar sweep effect */
function RadarSweep() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'conic-gradient(transparent 0deg, rgba(41,128,185,0.06) 30deg, transparent 60deg)',
          animation: 'radarSweep 4s linear infinite',
        }}
      />
    </div>
  )
}

/** SVG vector lines (geometric circuit pattern) */
function VectorLines() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]"
    >
      <line x1="0" y1="30%" x2="15%" y2="30%" stroke="#2980B9" strokeWidth="1" />
      <line x1="15%" y1="30%" x2="15%" y2="50%" stroke="#2980B9" strokeWidth="1" />
      <line x1="15%" y1="50%" x2="25%" y2="50%" stroke="#2980B9" strokeWidth="1" />
      <circle cx="25%" cy="50%" r="3" fill="#2980B9" />
      <line x1="100%" y1="70%" x2="85%" y2="70%" stroke="#0E8C6B" strokeWidth="1" />
      <line x1="85%" y1="70%" x2="85%" y2="45%" stroke="#0E8C6B" strokeWidth="1" />
      <line x1="85%" y1="45%" x2="75%" y2="45%" stroke="#0E8C6B" strokeWidth="1" />
      <circle cx="75%" cy="45%" r="3" fill="#0E8C6B" />
      <line x1="50%" y1="0" x2="50%" y2="15%" stroke="#2980B9" strokeWidth="0.5" />
      <line x1="50%" y1="15%" x2="65%" y2="15%" stroke="#2980B9" strokeWidth="0.5" />
      <circle cx="65%" cy="15%" r="2" fill="#2980B9" />
      <line x1="30%" y1="100%" x2="30%" y2="85%" stroke="#0E8C6B" strokeWidth="0.5" />
      <line x1="30%" y1="85%" x2="45%" y2="85%" stroke="#0E8C6B" strokeWidth="0.5" />
      <circle cx="45%" cy="85%" r="2" fill="#0E8C6B" />
    </svg>
  )
}

/** Corner bracket decorations */
function CornerBrackets() {
  return (
    <>
      <svg viewBox="0 0 64 64" fill="none" className="absolute top-6 left-6 w-16 h-16 opacity-20">
        <path d="M0 16V0H16" stroke="#2980B9" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="3" fill="#2980B9" opacity="0.5" />
      </svg>
      <svg viewBox="0 0 64 64" fill="none" className="absolute top-6 right-6 w-16 h-16 opacity-20">
        <path d="M64 16V0H48" stroke="#2980B9" strokeWidth="1.5" />
        <circle cx="64" cy="0" r="3" fill="#2980B9" opacity="0.5" />
      </svg>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="absolute bottom-6 left-6 w-16 h-16 opacity-20"
      >
        <path d="M0 48V64H16" stroke="#0E8C6B" strokeWidth="1.5" />
        <circle cx="0" cy="64" r="3" fill="#0E8C6B" opacity="0.5" />
      </svg>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="absolute bottom-6 right-6 w-16 h-16 opacity-20"
      >
        <path d="M64 48V64H48" stroke="#0E8C6B" strokeWidth="1.5" />
        <circle cx="64" cy="64" r="3" fill="#0E8C6B" opacity="0.5" />
      </svg>
    </>
  )
}

/** Drone SVG icon (real quadcopter with spinning rotors) */
function DroneSVG() {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <ellipse cx="100" cy="110" rx="22" ry="10" fill="white" fillOpacity="0.9" />
      <ellipse cx="100" cy="108" rx="18" ry="7" fill="white" fillOpacity="0.5" />
      <circle cx="100" cy="118" r="4" fill="white" fillOpacity="0.7" />
      <circle cx="100" cy="118" r="2" fill="#2980B9" fillOpacity="0.8" />
      {/* Arms */}
      <line
        x1="78"
        y1="106"
        x2="45"
        y2="85"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <line
        x1="122"
        y1="106"
        x2="155"
        y2="85"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <line
        x1="78"
        y1="112"
        x2="50"
        y2="130"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <line
        x1="122"
        y1="112"
        x2="150"
        y2="130"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Rotors */}
      <g className="drone-rotor-1">
        <ellipse cx="42" cy="82" rx="22" ry="4" fill="white" fillOpacity="0.3" />
        <circle cx="42" cy="82" r="3" fill="white" fillOpacity="0.6" />
      </g>
      <g className="drone-rotor-2">
        <ellipse cx="158" cy="82" rx="22" ry="4" fill="white" fillOpacity="0.3" />
        <circle cx="158" cy="82" r="3" fill="white" fillOpacity="0.6" />
      </g>
      <g className="drone-rotor-3">
        <ellipse cx="47" cy="133" rx="20" ry="3.5" fill="white" fillOpacity="0.25" />
        <circle cx="47" cy="133" r="2.5" fill="white" fillOpacity="0.5" />
      </g>
      <g className="drone-rotor-4">
        <ellipse cx="153" cy="133" rx="20" ry="3.5" fill="white" fillOpacity="0.25" />
        <circle cx="153" cy="133" r="2.5" fill="white" fillOpacity="0.5" />
      </g>
    </svg>
  )
}

/** 5 animated drones with SVG icons flying around the screen */
function DronePaths() {
  const drones = [
    { id: 'd1', left: '8%', top: '12%', floatDur: '12s', pathDur: '20s', opacity: 0.06 },
    { id: 'd2', left: '82%', top: '72%', floatDur: '10s', pathDur: '25s', opacity: 0.05 },
    { id: 'd3', left: '75%', top: '10%', floatDur: '8s', pathDur: '15s', opacity: 0.04 },
    { id: 'd4', left: '5%', top: '78%', floatDur: '16s', pathDur: '32s', opacity: 0.05 },
    { id: 'd5', left: '52%', top: '82%', floatDur: '14s', pathDur: '22s', opacity: 0.04 },
  ]
  return (
    <>
      {drones.map(drone => (
        <div
          key={drone.id}
          className="absolute pointer-events-none z-[1]"
          style={{
            left: drone.left,
            top: drone.top,
            animation: `float-login-${drone.id} ${drone.floatDur} ease-in-out infinite, path-login-${drone.id} ${drone.pathDur} ease-in-out infinite`,
          }}
        >
          <div className="pointer-events-none" style={{ opacity: drone.opacity }}>
            <DroneSVG />
          </div>
          <style jsx>{`
            @keyframes float-login-${drone.id} {
              0%,
              100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-15px);
              }
            }
          `}</style>
        </div>
      ))}
    </>
  )
}

/** Drone telemetry overlay (left) */
function DroneOverlay() {
  return (
    <div className="absolute top-5 left-24 pointer-events-none z-[2] hidden md:block">
      <div className="font-mono text-[9px] text-white/25 space-y-0.5 leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="text-[#0E8C6B]/60">◉</span>
          <span>DRONE-01</span>
          <span className="text-[#0E8C6B]/80">●</span>
          <span className="text-[#0E8C6B]/60">LIVE</span>
        </div>
        <div className="mt-1 space-y-px text-white/15">
          <div>LAT -23.5506°</div>
          <div>LON -46.6333°</div>
          <div>ALT 850.5 m</div>
          <div>SPD 10.4 km/h</div>
          <div>HDG 184°</div>
        </div>
      </div>
    </div>
  )
}

/** System info overlay (right) */
function SystemOverlay() {
  return (
    <div className="absolute bottom-5 right-24 pointer-events-none z-[2] text-right hidden md:block">
      <div className="font-mono text-[9px] text-white/20 space-y-0.5 leading-tight">
        <div>SYS · PLATFORM</div>
        <div>ENC AES-256-GCM</div>
        <div>TLS 1.3 · VERIFIED</div>
        <div>NODE BR-SP-01</div>
        <div>UPTIME 99.97%</div>
        <div>v2.0.0 · STABLE</div>
      </div>
    </div>
  )
}

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
// Main Login Page
// ============================================================================

type AuthMode = 'password' | 'magic'

export default function LoginPage() {
  const [socialLoading, setSocialLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [mode, setMode] = useState<AuthMode>('password')

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform'
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL
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
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Layer 0: Animated mesh background */}
      <div className="absolute inset-0 animated-mesh" />

      {/* Layer 1: Noise texture */}
      <NoiseOverlay />

      {/* Layer 2: Vignette */}
      <VignetteOverlay />

      {/* Layer 3: Status ticker */}
      <StatusTicker />

      {/* Layer 4: Animated scrolling grid */}
      <AnimatedGrid />

      {/* Layer 5: 30 floating particles */}
      <Particles />

      {/* Layer 6: Orbit rings */}
      <OrbitRings />

      {/* Layer 7: Scan line */}
      <ScanLine />

      {/* Layer 8: Vector lines */}
      <VectorLines />

      {/* Layer 9: Radar sweep */}
      <RadarSweep />

      {/* Layer 10: Corner brackets */}
      <CornerBrackets />

      {/* Layer 11: Drone telemetry overlays */}
      <DroneOverlay />
      <SystemOverlay />

      {/* Layer 12: 5 animated drones with SVG icons */}
      <DronePaths />

      {/* Main content */}
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

      {/* ================================================================== */}
      {/* CSS Animations — all keyframes matching aero-survey production     */}
      {/* ================================================================== */}
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

        /* Grid scroll */
        @keyframes gridScroll {
          0% {
            background-position: 0 0;
          }
          to {
            background-position: 0 60px;
          }
        }

        /* Particles */
        @keyframes particleFloat {
          0%,
          100% {
            opacity: 0.6;
            transform: translate(0) scale(1);
          }
          25% {
            opacity: 1;
            transform: translate(10px, -20px) scale(1.2);
          }
          50% {
            opacity: 0.4;
            transform: translate(-5px, -35px) scale(0.8);
          }
          75% {
            opacity: 0.8;
            transform: translate(15px, -15px) scale(1.1);
          }
        }

        /* Orbit rings */
        @keyframes orbitSpin {
          0% {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Scan line */
        @keyframes scanLine {
          0% {
            opacity: 0;
            top: -2px;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          to {
            opacity: 0;
            top: 100%;
          }
        }

        /* Radar sweep */
        @keyframes radarSweep {
          0% {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Status bar */
        .status-bar-scroll {
          width: max-content;
          animation: statusBarScroll 28s linear infinite;
        }
        @keyframes statusBarScroll {
          0% {
            transform: translate(0);
          }
          to {
            transform: translate(-50%);
          }
        }

        /* Logo glitch on load */
        .logo-glitch {
          animation: glitchLoad 1.2s ease-out forwards;
        }
        @keyframes glitchLoad {
          0% {
            filter: none;
            opacity: 1;
            transform: translate(0);
          }
          8% {
            filter: hue-rotate(80deg) saturate(3) brightness(1.5);
            transform: translate(-4px) skew(-3deg);
          }
          16% {
            filter: none;
            transform: translate(2px) skew(1deg);
          }
          24% {
            filter: hue-rotate(-60deg) saturate(2);
            transform: translate(-2px);
          }
          32% {
            filter: none;
            opacity: 0.8;
            transform: translate(0);
          }
          100% {
            filter: none;
            opacity: 1;
            transform: translate(0);
          }
        }

        /* Fade in up */
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

        /* Luminous card border */
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

        /* Drone rotor spin */
        .drone-rotor-1,
        .drone-rotor-2,
        .drone-rotor-3,
        .drone-rotor-4 {
          animation: rotorSpin 0.15s linear infinite;
        }
        .drone-rotor-1 {
          transform-origin: 42px 82px;
        }
        .drone-rotor-2 {
          transform-origin: 158px 82px;
          animation-direction: reverse;
        }
        .drone-rotor-3 {
          transform-origin: 47px 133px;
          animation-delay: 50ms;
        }
        .drone-rotor-4 {
          transform-origin: 153px 133px;
          animation-direction: reverse;
          animation-delay: 30ms;
        }
        @keyframes rotorSpin {
          0% {
            transform: scaleX(1);
          }
          25% {
            transform: scaleX(0.3);
          }
          50% {
            transform: scaleX(1);
          }
          75% {
            transform: scaleX(0.3);
          }
          100% {
            transform: scaleX(1);
          }
        }

        /* Drone path animations */
        @keyframes path-login-d1 {
          0% {
            left: 8%;
            top: 12%;
          }
          25% {
            left: 65%;
            top: 22%;
          }
          50% {
            left: 55%;
            top: 55%;
          }
          75% {
            left: 18%;
            top: 45%;
          }
          100% {
            left: 8%;
            top: 12%;
          }
        }
        @keyframes path-login-d2 {
          0% {
            left: 82%;
            top: 72%;
          }
          25% {
            left: 30%;
            top: 80%;
          }
          50% {
            left: 45%;
            top: 35%;
          }
          75% {
            left: 75%;
            top: 55%;
          }
          100% {
            left: 82%;
            top: 72%;
          }
        }
        @keyframes path-login-d3 {
          0% {
            left: 75%;
            top: 10%;
          }
          25% {
            left: 90%;
            top: 40%;
          }
          50% {
            left: 60%;
            top: 18%;
          }
          75% {
            left: 85%;
            top: 25%;
          }
          100% {
            left: 75%;
            top: 10%;
          }
        }
        @keyframes path-login-d4 {
          0% {
            left: 5%;
            top: 78%;
          }
          25% {
            left: 38%;
            top: 68%;
          }
          50% {
            left: 22%;
            top: 42%;
          }
          75% {
            left: 10%;
            top: 62%;
          }
          100% {
            left: 5%;
            top: 78%;
          }
        }
        @keyframes path-login-d5 {
          0% {
            left: 52%;
            top: 82%;
          }
          25% {
            left: 72%;
            top: 68%;
          }
          50% {
            left: 88%;
            top: 55%;
          }
          75% {
            left: 58%;
            top: 70%;
          }
          100% {
            left: 52%;
            top: 82%;
          }
        }
      `}</style>
    </main>
  )
}
