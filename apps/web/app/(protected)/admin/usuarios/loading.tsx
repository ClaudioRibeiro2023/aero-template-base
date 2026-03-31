function Sk({ className }: { className?: string }) {
  return <div className={`rounded shimmer ${className ?? ''}`} />
}

export default function UsuariosLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Sk className="h-8 w-32" />
        <Sk className="h-10 w-36 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Sk className="h-10 flex-1 max-w-sm rounded-lg" />
        <Sk className="h-10 w-36 rounded-lg" />
        <Sk className="h-10 w-36 rounded-lg" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Sk key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
