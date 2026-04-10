import { Suspense } from 'react'
import { NewTicketClient } from './NewTicketClient'

export default function NewTicketPage() {
  return (
    <Suspense
      fallback={
        <main className="ambient-gradient max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="shimmer h-7 w-40 rounded-lg" aria-hidden="true" />
          <div className="glass-panel p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="shimmer h-4 w-20 rounded" />
                <div className="shimmer h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </main>
      }
    >
      <NewTicketClient />
    </Suspense>
  )
}
