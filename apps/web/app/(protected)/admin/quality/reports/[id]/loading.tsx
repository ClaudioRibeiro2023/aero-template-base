function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function QualityReportLoading() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Sk className="h-8 w-48" />
      <Sk className="h-5 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Sk className="h-24 rounded-xl" />
        <Sk className="h-24 rounded-xl" />
        <Sk className="h-24 rounded-xl" />
      </div>
      <Sk className="h-64 rounded-xl" />
    </div>
  )
}
