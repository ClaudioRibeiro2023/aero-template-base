'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@template/shared'
import { SupabaseAuthProvider } from '@template/shared/auth/SupabaseAuthProvider'
import { DemoAuthProvider } from '@template/shared/auth/DemoAuthProvider'
import { AnnouncerProvider } from '@/components/common/LiveRegion'
import { useState, type ReactNode } from 'react'

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  const AuthProvider = isDemoMode ? DemoAuthProvider : SupabaseAuthProvider

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AnnouncerProvider>{children}</AnnouncerProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
