import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--surface-base)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--brand-primary)]">404</h1>
        <p className="mt-4 text-xl text-[var(--text-secondary)]">Pagina nao encontrada</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block px-6 py-2 rounded-lg bg-[var(--brand-primary)] text-white font-medium hover:opacity-90"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
