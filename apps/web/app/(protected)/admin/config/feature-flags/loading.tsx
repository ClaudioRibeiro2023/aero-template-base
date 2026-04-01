export default function FeatureFlagsLoading() {
  return (
    <main className="page-enter ambient-gradient max-w-3xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6 h-8 w-48 rounded-xl bg-white/[0.04] animate-pulse" />
      <div className="relative z-10 glass-panel divide-y divide-[var(--glass-border)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-4">
            <div className="space-y-1.5">
              <div className="h-4 w-40 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-3 w-64 rounded bg-white/[0.03] animate-pulse" />
            </div>
            <div className="h-6 w-11 rounded-full bg-white/[0.04] animate-pulse" />
          </div>
        ))}
      </div>
    </main>
  )
}
