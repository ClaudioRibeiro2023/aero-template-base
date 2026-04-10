import { Suspense } from 'react'
import { TicketsListClient } from './TicketsListClient'

function TicketsSkeleton() {
  return (
    <main className="ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="shimmer h-7 w-40 rounded-lg" aria-hidden="true" />
          <div className="shimmer h-4 w-56 rounded-lg" aria-hidden="true" />
        </div>
        <div className="shimmer h-10 w-32 rounded-xl" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-panel p-4 flex items-center gap-4" aria-hidden="true">
            <div className="shimmer h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="shimmer h-4 w-3/4 rounded" />
              <div className="shimmer h-3 w-1/2 rounded" />
            </div>
            <div className="shimmer h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </main>
  )
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<TicketsSkeleton />}>
      <TicketsListClient />
    </Suspense>
  )
}
