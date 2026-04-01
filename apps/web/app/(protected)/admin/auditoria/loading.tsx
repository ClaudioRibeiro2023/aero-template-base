export default function AuditoriaLoading() {
  return (
    <main className="page-enter ambient-gradient max-w-5xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6 h-8 w-48 rounded-xl bg-white/[0.04] animate-pulse" />
      <div className="relative z-10 glass-panel overflow-hidden">
        <div className="h-12 border-b border-[var(--glass-border)] bg-white/[0.02]" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-3.5 border-b border-[var(--glass-border)]"
          >
            <div className="h-4 w-24 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-4 w-16 rounded bg-white/[0.03] animate-pulse" />
            <div className="h-4 w-32 rounded bg-white/[0.04] animate-pulse" />
            <div className="h-4 flex-1 rounded bg-white/[0.03] animate-pulse" />
          </div>
        ))}
      </div>
    </main>
  )
}
