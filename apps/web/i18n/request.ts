import { getRequestConfig } from 'next-intl/server'
import { defaultLocale } from '../i18n'

export default getRequestConfig(async () => {
  const locale = defaultLocale

  // Load requested locale messages + pt-BR as fallback
  const messages = (await import(`../messages/${locale}.json`)).default
  const fallbackMessages =
    locale !== 'pt-BR' ? (await import('../messages/pt-BR.json')).default : undefined

  return {
    locale,
    messages: fallbackMessages ? { ...fallbackMessages, ...messages } : messages,
    // Suppress missing translation warnings in production
    onError: process.env.NODE_ENV === 'production' ? () => {} : undefined,
  }
})
