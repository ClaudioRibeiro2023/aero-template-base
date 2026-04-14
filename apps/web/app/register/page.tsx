'use client'

import '@/styles/auth-animations.css'
import {
  NoiseOverlay,
  VignetteOverlay,
  StatusTicker,
  AnimatedGrid,
  Particles,
  OrbitRings,
  ScanLine,
  VectorLines,
  RadarSweep,
  CornerBrackets,
  DroneOverlay,
  SystemOverlay,
  DronePaths,
} from '../login/components/LoginVisualEffects'
import { RegisterForm } from './components/RegisterForm'

export default function RegisterPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform'
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL

  const gradientColors =
    process.env.NEXT_PUBLIC_GRADIENT_COLORS || '#0c2340,#163b5c,#0e8c6b,#0c2340,#1a4a73'

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 animated-mesh"
        style={{
          background: `linear-gradient(-45deg, ${gradientColors})`,
          backgroundSize: '400% 400%',
        }}
      />
      <NoiseOverlay />
      <VignetteOverlay />
      <StatusTicker />
      <AnimatedGrid />
      <Particles />
      <OrbitRings />
      <ScanLine />
      <VectorLines />
      <RadarSweep />
      <CornerBrackets />
      <DroneOverlay />
      <SystemOverlay />
      <DronePaths />

      <RegisterForm appName={appName} logoUrl={logoUrl} />
    </main>
  )
}
