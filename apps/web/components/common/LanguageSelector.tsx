/**
 * LanguageSelector — Sprint P0-1 i18n
 * Dropdown to switch between pt-BR and en-US.
 */
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import clsx from 'clsx'
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS, type SupportedLanguage } from '@/i18n'

const FLAGS: Record<SupportedLanguage, string> = {
  'pt-BR': 'BR',
  'en-US': 'US',
}

interface LanguageSelectorProps {
  compact?: boolean
}

export function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const currentLang = (i18n.language || 'pt-BR') as SupportedLanguage

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const switchLanguage = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="p-2 rounded-lg hover:bg-surface-muted transition-colors flex items-center gap-1.5"
        title={LANGUAGE_LABELS[currentLang]}
        aria-label="Trocar idioma"
      >
        <Globe size={compact ? 18 : 20} className="text-text-secondary" />
        {!compact && (
          <span className="text-xs font-medium text-text-secondary">{FLAGS[currentLang]}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border-default bg-surface-elevated shadow-lg z-50 py-1">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => switchLanguage(lang)}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                lang === currentLang
                  ? 'bg-brand-primary/10 text-brand-primary font-medium'
                  : 'text-text-primary hover:bg-surface-muted'
              )}
            >
              <span className="text-xs font-mono w-6">{FLAGS[lang]}</span>
              <span>{LANGUAGE_LABELS[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
