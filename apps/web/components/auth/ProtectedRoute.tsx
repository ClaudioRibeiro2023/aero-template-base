import { env } from '@/lib/env'
;('use client')

import type { ReactNode } from 'react'
// React Router available for redirects if needed
import { useAuth, type Role } from '@template/shared'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: Role[]
  requireAll?: boolean // true = needs ALL roles, false = needs ANY role
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requireAll = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, hasAnyRole, login } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // In demo/e2e mode, just render children
    const isDemoMode = env.DEMO_MODE
    const isE2EMode = false

    if (isDemoMode || isE2EMode) {
      return <>{children}</>
    }

    // Trigger login redirect
    login()
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-base">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary">Redirecionando para login...</p>
        </div>
      </div>
    )
  }

  // Check role-based access
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAccess = requireAll ? hasRole(requiredRoles) : hasAnyRole(requiredRoles)

    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-surface-base">
          <div className="max-w-md p-8 text-center bg-surface-elevated rounded-xl shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Acesso Negado</h2>
            <p className="text-text-secondary mb-6">
              Você não tem permissão para acessar esta página.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
            >
              Voltar ao Início
            </a>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
