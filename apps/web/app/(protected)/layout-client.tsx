'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { ToastProvider } from '@/components/ui/Toast'

// Rotas críticas para pré-busca antecipada
const PREFETCH_ROUTES = ['/dashboard', '/admin/config', '/admin/usuarios', '/profile']

export function ProtectedLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  // Pré-buscar rotas críticas após mount para reduzir latência de navegação
  useEffect(() => {
    const timer = setTimeout(() => {
      PREFETCH_ROUTES.forEach(route => router.prefetch(route))
    }, 1000) // aguardar 1s para não competir com o carregamento inicial
    return () => clearTimeout(timer)
  }, [router])

  return (
    <ToastProvider>
      <AppLayout>{children}</AppLayout>
    </ToastProvider>
  )
}
