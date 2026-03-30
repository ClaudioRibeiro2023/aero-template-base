'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SupabaseAuthProvider } from '@template/shared/auth/SupabaseAuthProvider'
import { DemoAuthProvider } from '@template/shared/auth/DemoAuthProvider'
import { useState, type ReactNode } from 'react'

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      })
  )

  const AuthProvider = isDemoMode ? DemoAuthProvider : SupabaseAuthProvider

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
