export default function TasksLoading() {
  return (
    <main className="ambient-gradient max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <div className="shimmer h-7 w-32 rounded-lg" aria-hidden="true" />
        <div className="shimmer h-4 w-64 rounded-lg" aria-hidden="true" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-panel p-4 flex items-center gap-4" aria-hidden="true">
            <div className="shimmer h-5 w-5 rounded" />
            <div className="flex-1 space-y-2">
              <div className="shimmer h-4 w-3/4 rounded" />
              <div className="shimmer h-3 w-1/2 rounded" />
            </div>
            <div className="shimmer h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </main>
  )
}
