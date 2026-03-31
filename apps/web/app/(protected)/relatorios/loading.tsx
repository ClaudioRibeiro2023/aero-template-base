function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function RelatoriosLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Sk className="h-8 w-40 mb-2" />
          <Sk className="h-5 w-64" />
        </div>
        <Sk className="h-10 w-36 rounded-lg" />
      </div>

      {/* Filters row */}
      <div className="flex gap-3">
        <Sk className="h-10 w-48 rounded-lg" />
        <Sk className="h-10 w-48 rounded-lg" />
        <Sk className="h-10 w-32 rounded-lg" />
      </div>

      {/* Report cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-white/[0.06] bg-[var(--glass-bg)] space-y-3"
          >
            <div className="flex items-center gap-3">
              <Sk className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Sk className="h-4 w-3/4" />
                <Sk className="h-3 w-1/2" />
              </div>
            </div>
            <Sk className="h-20 w-full rounded-lg" />
            <Sk className="h-8 w-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
