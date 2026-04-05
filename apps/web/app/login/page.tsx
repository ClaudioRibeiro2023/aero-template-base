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
} from './components/LoginVisualEffects'
import { LoginForm } from './components/LoginForm'

export default function LoginPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform'
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL

  // Gradient colors configuráveis via env — cada app terá combinação única
  const gradientColors =
    process.env.NEXT_PUBLIC_GRADIENT_COLORS || '#0c2340,#163b5c,#0e8c6b,#0c2340,#1a4a73'

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Layer 0: Animated mesh background */}
      <div
        className="absolute inset-0 animated-mesh"
        style={{
          background: `linear-gradient(-45deg, ${gradientColors})`,
          backgroundSize: '400% 400%',
        }}
      />

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
      <LoginForm appName={appName} logoUrl={logoUrl} />

      {/* ================================================================== */}
      {/* CSS Animations — all keyframes matching aero-survey production     */}
      {/* ================================================================== */}
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
