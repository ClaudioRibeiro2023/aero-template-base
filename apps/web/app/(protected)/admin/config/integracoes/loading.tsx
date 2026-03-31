function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function IntegracoesLoading() {
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

      {/* API Key card */}
      <div className="p-6 rounded-xl border border-white/[0.06] bg-[var(--glass-bg)] space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Sk className="h-4 w-4 rounded" />
          <Sk className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Sk className="h-10 flex-1 rounded-xl" />
          <Sk className="h-10 w-20 rounded-xl" />
        </div>
      </div>

      {/* Webhooks card */}
      <div className="p-6 rounded-xl border border-white/[0.06] bg-[var(--glass-bg)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sk className="h-4 w-4 rounded" />
            <Sk className="h-4 w-20" />
          </div>
          <Sk className="h-4 w-20" />
        </div>
        {/* Webhook entries */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <Sk className="h-9 w-full rounded-xl" />
              <Sk className="h-9 w-full rounded-xl" />
            </div>
            <Sk className="h-9 w-9 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Sk className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  )
}
