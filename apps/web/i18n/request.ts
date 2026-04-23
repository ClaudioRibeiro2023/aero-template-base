import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import { defaultLocale, locales, type Locale } from '../i18n'

/**
 * Resolve locale com ordem:
 * 1. cookie `locale` (setado por /api/user/locale)
 * 2. Accept-Language header
 * 3. defaultLocale (pt-BR)
 *
 * Fix Sprint QA+: antes o locale era sempre defaultLocale (cookie ignorado)
 * — o seletor de idioma no Omnibar não produzia efeito real.
 */
function resolveLocale(): Locale {
  try {
    const cookieStore = cookies()
    const fromCookie = cookieStore.get('locale')?.value
    if (fromCookie && (locales as readonly string[]).includes(fromCookie)) {
      return fromCookie as Locale
    }

    const accept = headers().get('accept-language') ?? ''
    for (const raw of accept.split(',')) {
      const tag = raw.split(';')[0].trim()
      if ((locales as readonly string[]).includes(tag)) return tag as Locale
      // match por prefixo: 'en' → 'en-US'
      const prefix = tag.split('-')[0]
      const match = locales.find(l => l.startsWith(prefix))
      if (match) return match
    }
  } catch {
    // getRequestConfig pode ser chamado fora de request (build-time) — degrada
  }
  return defaultLocale
}

export default getRequestConfig(async () => {
  const locale = resolveLocale()

  // Load requested locale messages + pt-BR as fallback
  const messages = (await import(`../messages/${locale}.json`)).default
  const fallbackMessages =
    locale !== 'pt-BR' ? (await import('../messages/pt-BR.json')).default : undefined

  return {
    locale,
    timeZone: 'America/Sao_Paulo',
    messages: fallbackMessages ? { ...fallbackMessages, ...messages } : messages,
    onError: process.env.NODE_ENV === 'production' ? () => {} : undefined,
  }
})
