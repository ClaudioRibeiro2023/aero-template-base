import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-6xl font-bold text-[var(--text-muted)]">404</h1>
      <p className="mt-4 text-lg text-[var(--text-secondary)]">Página não encontrada</p>
      <Link
        href="/dashboard"
        className="mt-6 px-6 py-2 rounded-lg bg-[var(--brand-primary)] text-white font-medium hover:opacity-90"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  )
}
