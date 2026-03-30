/**
 * LanguageSwitcher — Sprint 30
 * Dropdown to switch between supported languages (pt-BR / en-US).
 */
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, type SupportedLanguage } from '../../i18n'

export interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as SupportedLanguage
    i18n.changeLanguage(lang)
  }

  return (
    <div data-testid="language-switcher" className={className}>
      <label htmlFor="lang-select" className="sr-only">
        {t('language.label')}
      </label>
      <select
        id="lang-select"
        value={i18n.language}
        onChange={handleChange}
        className="appearance-none bg-surface-elevated border border-border-default rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
      >
        {SUPPORTED_LANGUAGES.map(lang => (
          <option key={lang} value={lang}>
            {LANGUAGE_LABELS[lang]}
          </option>
        ))}
      </select>
    </div>
  )
}
