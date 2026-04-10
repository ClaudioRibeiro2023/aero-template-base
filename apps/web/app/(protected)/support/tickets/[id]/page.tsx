import { Suspense } from 'react'
import { TicketDetailClient } from './TicketDetailClient'

function DetailSkeleton() {
  return (
    <main className="ambient-gradient max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="shimmer h-5 w-20 rounded" aria-hidden="true" />
      <div className="glass-panel p-6 space-y-4">
        <div className="shimmer h-6 w-2/3 rounded" />
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-1/2 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-panel p-4 space-y-2">
            <div className="shimmer h-3 w-24 rounded" />
            <div className="shimmer h-4 w-full rounded" />
          </div>
        ))}
      </div>
    </main>
  )
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <TicketDetailClient params={params} />
    </Suspense>
  )
}
