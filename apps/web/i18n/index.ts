/**
 * i18n configuration — Sprint 30
 * Supports pt-BR and en-US with namespace-based translations.
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// pt-BR
import ptCommon from './locales/pt-BR/common.json'
import ptTasks from './locales/pt-BR/tasks.json'
import ptAnalytics from './locales/pt-BR/analytics.json'
import ptAdmin from './locales/pt-BR/admin.json'
import ptSidebar from './locales/pt-BR/sidebar.json'

// en-US
import enCommon from './locales/en-US/common.json'
import enTasks from './locales/en-US/tasks.json'
import enAnalytics from './locales/en-US/analytics.json'
import enAdmin from './locales/en-US/admin.json'
import enSidebar from './locales/en-US/sidebar.json'

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'pt-BR': 'Português',
  'en-US': 'English',
}

export const defaultNS = 'common'
export const ns = ['common', 'tasks', 'analytics', 'admin', 'sidebar'] as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': {
        common: ptCommon,
        tasks: ptTasks,
        analytics: ptAnalytics,
        admin: ptAdmin,
        sidebar: ptSidebar,
      },
      'en-US': {
        common: enCommon,
        tasks: enTasks,
        analytics: enAnalytics,
        admin: enAdmin,
        sidebar: enSidebar,
      },
    },
    fallbackLng: 'pt-BR',
    defaultNS,
    ns,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18n_language',
      caches: ['localStorage'],
    },
  })

export default i18n
