import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#09090b' }}
    >
      {/* Ambient gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 600px 400px at 20% 10%, rgba(0,180,216,0.06), transparent), radial-gradient(ellipse 500px 500px at 80% 80%, rgba(167,139,250,0.04), transparent)',
        }}
      />
      <div
        className="relative flex flex-col items-center gap-5 p-8 text-center max-w-sm"
        style={{
          background: 'rgba(24, 24, 27, 0.72)',
          backdropFilter: 'blur(12px) saturate(1.2)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
        }}
      >
        <FileQuestion size={48} className="text-zinc-600" />
        <div>
          <h1 className="text-5xl font-bold text-zinc-200 font-mono">404</h1>
          <p className="mt-2 text-sm text-zinc-500">Página não encontrada</p>
        </div>
        <Link
          href="/dashboard"
          className="mt-1 inline-flex items-center px-5 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity duration-150"
          style={{ background: '#00b4d8' }}
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
