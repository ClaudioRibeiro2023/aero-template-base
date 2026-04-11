function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Sk className="h-8 w-40 mb-2" />
        <Sk className="h-5 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Sk key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Sk className="h-72 rounded-xl" />
        <Sk className="h-72 rounded-xl" />
      </div>
    </div>
  )
}
