function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function AparenciaLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Sk className="h-8 w-8 rounded-xl" />
        <div className="space-y-1.5">
          <Sk className="h-6 w-32" />
          <Sk className="h-4 w-56" />
        </div>
      </div>

      {/* Form card */}
      <div className="p-6 rounded-xl border border-white/[0.06] bg-[var(--glass-bg)] space-y-5">
        {/* Color pickers row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Sk className="h-4 w-24" />
            <div className="flex items-center gap-2">
              <Sk className="h-10 w-10 rounded-xl" />
              <Sk className="h-10 flex-1 rounded-xl" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Sk className="h-4 w-28" />
            <div className="flex items-center gap-2">
              <Sk className="h-10 w-10 rounded-xl" />
              <Sk className="h-10 flex-1 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Logo URL */}
        <div className="space-y-1.5">
          <Sk className="h-4 w-20" />
          <Sk className="h-10 w-full rounded-xl" />
          <Sk className="h-3 w-64" />
        </div>

        {/* Preview */}
        <div className="p-4 rounded-xl border border-white/[0.06] bg-[var(--glass-bg)] space-y-3">
          <Sk className="h-3 w-16" />
          <div className="flex items-center gap-3">
            <Sk className="h-9 w-9 rounded-xl" />
            <Sk className="h-4 w-32" />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Sk className="h-10 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
