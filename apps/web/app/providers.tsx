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
import { useState, type ReactNode } from 'react'

// IDs dos módulos habilitados — importado do sistema modular (build-time)
// Em runtime, o middleware já bloqueia rotas desabilitadas.
// Este array alimenta o ModuleProvider para conditional rendering client-side.
const ENABLED_MODULES: string[] = Array.from(enabledModuleIds)

// Guard: DEMO_MODE never active in production (see also lib/demo-data.ts)
const isDemoMode =
  process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  const AuthProvider = isDemoMode ? DemoAuthProvider : SupabaseAuthProvider

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
