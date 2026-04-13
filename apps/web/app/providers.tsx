'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@template/shared'
import { SupabaseAuthProvider } from '@template/shared/auth/SupabaseAuthProvider'
import { DemoAuthProvider } from '@template/shared/auth/DemoAuthProvider'
import { AnnouncerProvider } from '@/components/common/LiveRegion'
import { ThemeProvider } from '@/hooks/useTheme'
import { GlobalSearchProvider } from '@/components/search'
import { ModuleProvider } from '@/lib/module-context'
import { useState, type ReactNode } from 'react'

// IDs dos módulos habilitados — importado do sistema modular (build-time)
// Em runtime, o middleware já bloqueia rotas desabilitadas.
// Este array alimenta o ModuleProvider para conditional rendering client-side.
const ENABLED_MODULES = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { enabledModuleIds } = require('@/config/modules')
    return Array.from(enabledModuleIds) as string[]
  } catch {
    // Fallback: todos habilitados (evita crash se o módulo loader falhar)
    return [
      'auth',
      'admin',
      'settings',
      'search',
      'dashboard',
      'reports',
      'tasks',
      'notifications',
      'feature-flags',
      'file-upload',
    ]
  }
})()

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

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
