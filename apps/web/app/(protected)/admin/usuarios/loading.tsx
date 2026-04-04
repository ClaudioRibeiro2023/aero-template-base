export default function UsersLoading() {
  return (
    <main className="page-enter ambient-gradient max-w-6xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6">
        <div className="h-8 w-48 rounded-lg shimmer mb-2" />
        <div className="h-4 w-64 rounded shimmer" />
      </div>
      <div className="relative z-10 glass-panel p-6">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded shimmer" />
                <div className="h-3 w-56 rounded shimmer" />
              </div>
              <div className="h-6 w-16 rounded-full shimmer" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
