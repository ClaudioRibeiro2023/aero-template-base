function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function SettingsLoading() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Sk className="h-8 w-48" />
      <div className="space-y-4">
        <Sk className="h-10 w-full rounded-lg" />
        <Sk className="h-10 w-full rounded-lg" />
        <Sk className="h-10 w-full rounded-lg" />
        <Sk className="h-10 w-full rounded-lg" />
      </div>
      <Sk className="h-10 w-32 rounded-lg" />
    </div>
  )
}
