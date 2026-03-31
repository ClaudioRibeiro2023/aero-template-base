function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function ConfigLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <Sk className="h-8 w-48 mb-2" />
        <Sk className="h-5 w-72" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-4 border-b border-white/[0.06] pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Sk key={i} className="h-8 w-28 rounded-lg" />
        ))}
      </div>

      {/* Config cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-white/[0.06] bg-[var(--glass-bg)] space-y-4"
          >
            <Sk className="h-5 w-40" />
            <Sk className="h-10 w-full rounded-lg" />
            <Sk className="h-10 w-full rounded-lg" />
            <Sk className="h-10 w-2/3 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
