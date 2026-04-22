'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@template/shared'
import { SupabaseAuthProvider } from '@template/shared/auth/SupabaseAuthProvider'
import { DemoAuthProvider } from '@template/shared/auth/DemoAuthProvider'
import { AnnouncerProvider } from '@/components/common/LiveRegion'
import { ThemeProvider } from '@/hooks/useTheme'
import { GlobalSearchProvider } from '@/components/search'
import { ModuleProvider } from '@/lib/module-context'
import { enabledModuleIds } from '@/config/modules'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode, Fragment, type ComponentType } from 'react'

// Rotas publicas de auth NAO devem montar SupabaseAuthProvider.
// O provider dispara supabase.auth.getSession() no mount, o que em
// presenca de token stale no localStorage cascateia o loop de
// refresh_token. /login, /register etc. nao precisam de sessao client.
const PUBLIC_AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

// IDs dos módulos habilitados — importado do sistema modular (build-time)
// Em runtime, o middleware já bloqueia rotas desabilitadas.
// Este array alimenta o ModuleProvider para conditional rendering client-side.
const ENABLED_MODULES: string[] = Array.from(enabledModuleIds)

// Guard: DEMO_MODE never active in production (see also lib/demo-data.ts)
const isDemoMode =
  process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())
  const pathname = usePathname()

  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some(
    p => pathname === p || pathname.startsWith(`${p}/`)
  )

  // Em rotas publicas de auth: usar Fragment (sem provider) para evitar
  // inicializacao do cliente Supabase, que dispara o loop de refresh_token
  // quando ha token stale no localStorage. A pagina de login gerencia o
  // signIn localmente via import direto do `supabase` client.
  const AuthProvider: ComponentType<{ children: ReactNode }> = isPublicAuthRoute
    ? Fragment
    : isDemoMode
      ? DemoAuthProvider
      : SupabaseAuthProvider

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModuleProvider enabledModules={ENABLED_MODULES}>
          <ThemeProvider>
            <GlobalSearchProvider>
              <AnnouncerProvider>{children}</AnnouncerProvider>
            </GlobalSearchProvider>
          </ThemeProvider>
        </ModuleProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
