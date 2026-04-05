'use client'

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

      <style jsx>{`
        .animated-mesh {
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
      `}</style>
    </main>
  )
}
