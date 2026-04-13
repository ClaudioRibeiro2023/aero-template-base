'use client'

import { useEffect, useState } from 'react'
import { NextIntlClientProvider } from 'next-intl'

/**
 * IntlProvider wrapper — detects timezone on client AFTER hydration.
 *
 * CRITICAL: The timeZone must be identical on SSR and during the first client
 * render (hydration pass). Using `typeof window` in useMemo produced different
 * values (SSR: 'America/Sao_Paulo', client: browser timezone) which caused
 * every `format.dateTime()` call in child Client Components to render different
 * text → React errors #425/#418/#423.
 *
 * Fix: always start with the same fallback timezone, then update via useEffect.
 */
const FALLBACK_TZ = 'America/Sao_Paulo'

export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: string
  messages: Record<string, unknown>
  children: React.ReactNode
}) {
  // Start with fallback — identical on SSR and client hydration pass.
  const [timeZone, setTimeZone] = useState(FALLBACK_TZ)

  // After hydration, detect the real browser timezone.
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detected && detected !== FALLBACK_TZ) {
        setTimeZone(detected)
      }
    } catch {
      // Intl API failed — keep fallback
    }
  }, [])

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      {children}
    </NextIntlClientProvider>
  )
}
