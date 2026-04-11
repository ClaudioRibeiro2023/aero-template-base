function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function SecurityLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Sk className="h-8 w-40" />
      <div className="space-y-4">
        <Sk className="h-10 w-full rounded-lg" />
        <Sk className="h-10 w-full rounded-lg" />
        <Sk className="h-10 w-full rounded-lg" />
      </div>
      <Sk className="h-24 w-full rounded-lg" />
    </div>
  )
}
