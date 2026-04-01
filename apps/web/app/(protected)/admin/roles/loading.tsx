export default function RolesLoading() {
  return (
    <main className="page-enter ambient-gradient max-w-6xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6 h-8 w-48 rounded-xl bg-white/[0.04] animate-pulse" />
      <div className="relative z-10 flex gap-6">
        {/* Sidebar skeleton */}
        <div className="w-56 shrink-0 glass-panel p-3 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
        {/* Matrix skeleton */}
        <div className="flex-1 glass-panel p-6 space-y-3">
          <div className="h-5 w-32 rounded bg-white/[0.04] animate-pulse mb-6" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  )
}
