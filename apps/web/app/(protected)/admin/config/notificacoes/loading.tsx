function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function NotificacoesLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Sk className="h-8 w-8 rounded-xl" />
        <div className="space-y-1.5">
          <Sk className="h-6 w-28" />
          <Sk className="h-4 w-48" />
        </div>
      </div>

      {/* Toggle card */}
      <div className="p-6 rounded-xl border border-white/[0.06] bg-[var(--glass-bg)] divide-y divide-white/[0.06]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3.5">
            <div className="space-y-1">
              <Sk className="h-4 w-36" />
              <Sk className="h-3 w-56" />
            </div>
            <Sk className="h-6 w-11 rounded-full" />
          </div>
        ))}

        {/* Save button */}
        <div className="flex justify-end pt-4">
          <Sk className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
