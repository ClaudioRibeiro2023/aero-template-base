function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function GeralLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Sk className="h-8 w-8 rounded-xl" />
        <div className="space-y-1.5">
          <Sk className="h-6 w-44" />
          <Sk className="h-4 w-56" />
        </div>
      </div>

      {/* Form card */}
      <div className="p-6 rounded-xl border border-white/[0.06] bg-[var(--glass-bg)] space-y-5">
        {/* App name */}
        <div className="space-y-1.5">
          <Sk className="h-4 w-28" />
          <Sk className="h-10 w-full rounded-xl" />
          <Sk className="h-3 w-52" />
        </div>

        {/* Language */}
        <div className="space-y-1.5">
          <Sk className="h-4 w-24" />
          <Sk className="h-10 w-full rounded-xl" />
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Sk className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
