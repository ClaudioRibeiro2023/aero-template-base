/**
 * Dashboard Page — Server Component (RSC)
 *
 * Sprint 6 (P2-03): Convertido para Server Component com Suspense streaming.
 * - Dados calculados no servidor (appName, data formatada)
 * - Partes interativas delegadas ao DashboardClient (Client Component)
 * - Suspense boundary com fallback skeleton para streaming incremental
 */
import { Suspense } from 'react'
import { DashboardClient } from './DashboardClient'

// ── Server-side data (em produção: buscar do Supabase com createServerClient) ──
async function getDashboardData() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Template Platform'
  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return { appName, dateLabel }
}

// ── Suspense fallback: skeleton que replica o layout ──
function DashboardSkeleton() {
  return (
    <main className="ambient-gradient max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header skeleton */}
      <div className="relative z-10 space-y-2">
        <div className="shimmer h-7 w-48 rounded-lg" aria-hidden="true" />
        <div className="shimmer h-4 w-72 rounded-lg" aria-hidden="true" />
      </div>

      {/* KPI grid skeleton */}
      <section aria-label="Carregando indicadores" className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-panel p-5 space-y-3" aria-hidden="true">
              <div className="shimmer h-4 w-20 rounded-lg" />
              <div className="shimmer h-8 w-16 rounded-lg" />
              <div className="shimmer h-3 w-12 rounded-lg" />
            </div>
          ))}
        </div>
      </section>

      {/* Charts skeleton */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 glass-panel p-6 h-48" aria-hidden="true">
          <div className="shimmer h-full w-full rounded-lg" />
        </div>
        <div className="lg:col-span-2 glass-panel p-6 h-48" aria-hidden="true">
          <div className="shimmer h-full w-full rounded-lg" />
        </div>
      </div>
    </main>
  )
}

// ── Dashboard async content ──
async function DashboardContent() {
  const { appName, dateLabel } = await getDashboardData()
  return <DashboardClient appName={appName} dateLabel={dateLabel} />
}

// ── Page (RSC entry point) ──
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
