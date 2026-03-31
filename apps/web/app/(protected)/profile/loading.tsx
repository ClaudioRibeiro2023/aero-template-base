function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function ProfileLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <Sk className="h-8 w-32" />
      <div className="flex items-center gap-4">
        <Sk className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Sk className="h-5 w-40" />
          <Sk className="h-4 w-56" />
        </div>
      </div>
      <div className="space-y-4">
        <Sk className="h-10 w-full rounded-lg" />
        <Sk className="h-10 w-full rounded-lg" />
        <Sk className="h-24 w-full rounded-lg" />
      </div>
    </div>
  )
}
