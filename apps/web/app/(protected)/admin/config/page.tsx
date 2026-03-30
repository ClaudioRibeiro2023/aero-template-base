'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { ChevronRight, Sliders, Paintbrush, Bell, Plug } from 'lucide-react'

const SECTIONS = [
  {
    id: 'geral',
    title: 'Geral',
    description: 'Nome do sistema, idioma e configurações básicas',
    icon: Sliders,
    path: '/admin/config/geral',
  },
  {
    id: 'aparencia',
    title: 'Aparência',
    description: 'Tema, cores e branding da plataforma',
    icon: Paintbrush,
    path: '/admin/config/aparencia',
  },
  {
    id: 'notificacoes',
    title: 'Notificações',
    description: 'Email, push e configuração de alertas',
    icon: Bell,
    path: '/admin/config/notificacoes',
  },
  {
    id: 'integracoes',
    title: 'Integrações',
    description: 'APIs, webhooks e serviços externos',
    icon: Plug,
    path: '/admin/config/integracoes',
  },
]

export default function ConfigPage() {
  const { hasRole } = useAuth()
  const isAdmin = hasRole('ADMIN') || hasRole('GESTOR')

  if (!isAdmin) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Acesso negado</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Você precisa de permissão ADMIN ou GESTOR para acessar esta página.
        </p>
      </main>
    )
  }

  return (
    <main className="page-enter max-w-3xl mx-auto p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Gerencie as configurações do sistema
        </p>
      </div>

      <div className="space-y-2">
        {SECTIONS.map(section => {
          const Icon = section.icon
          return (
            <Link
              key={section.id}
              href={section.path}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] hover:border-[var(--brand-primary)]/40 hover:shadow-sm transition-all group"
            >
              <div className="p-2.5 rounded-lg bg-[var(--brand-primary)]/10 flex-shrink-0">
                <Icon size={20} className="text-[var(--brand-primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold group-hover:text-[var(--brand-primary)] transition-colors">
                  {section.title}
                </p>
                <p className="text-sm text-[var(--text-muted)] truncate">{section.description}</p>
              </div>
              <ChevronRight
                size={18}
                className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors flex-shrink-0"
              />
            </Link>
          )
        })}
      </div>
    </main>
  )
}
