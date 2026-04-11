'use client'

import { NextIntlClientProvider } from 'next-intl'

const detectedTimeZone =
  typeof window !== 'undefined'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'America/Sao_Paulo'

export function IntlProvider({
  locale,
  messages,
  children,
}: {
  locale: string
  messages: Record<string, unknown>
  children: React.ReactNode
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={detectedTimeZone}>
      {children}
    </NextIntlClientProvider>
  )
}
