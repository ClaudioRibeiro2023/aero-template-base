import { Suspense } from 'react'
import { QualityDashboardClient } from './QualityDashboardClient'

function QualitySkeleton() {
  return (
    <main className="ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="shimmer h-7 w-56 rounded-lg" aria-hidden="true" />
          <div className="shimmer h-4 w-72 rounded-lg" aria-hidden="true" />
        </div>
        <div className="shimmer h-10 w-40 rounded-xl" aria-hidden="true" />
      </div>
      <div className="shimmer h-40 w-48 mx-auto rounded-2xl" aria-hidden="true" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-panel p-4 h-24" aria-hidden="true">
            <div className="shimmer h-full w-full rounded" />
          </div>
        ))}
      </div>
    </main>
  )
}

export default function QualityPage() {
  return (
    <Suspense fallback={<QualitySkeleton />}>
      <QualityDashboardClient />
    </Suspense>
  )
}
