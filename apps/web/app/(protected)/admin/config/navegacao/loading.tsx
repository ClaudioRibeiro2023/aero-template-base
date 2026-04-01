export default function NavegacaoLoading() {
  return (
    <main className="page-enter ambient-gradient max-w-3xl mx-auto p-4 sm:p-8">
      <div className="relative z-10 mb-6 h-8 w-48 rounded-xl bg-white/[0.04] animate-pulse" />
      <div className="relative z-10 glass-panel p-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    </main>
  )
}
