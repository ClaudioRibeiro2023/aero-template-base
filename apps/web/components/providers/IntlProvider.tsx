'use client'

import { useMemo } from 'react'
import { NextIntlClientProvider } from 'next-intl'

/**
 * IntlProvider wrapper — detects timezone on client after hydration.
 * Uses a stable fallback during SSR to avoid hydration mismatches.
 */
export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: string
  messages: Record<string, unknown>
  children: React.ReactNode
}) {
  // Detect timezone inside component to avoid module-level SSR/client mismatch.
  // useMemo ensures it's computed once per mount (consistent during hydration).
  const timeZone = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone
      } catch {
        // Fallback if Intl API fails
      }
    }
    return 'America/Sao_Paulo'
  }, [])

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      {children}
    </NextIntlClientProvider>
  )
}
