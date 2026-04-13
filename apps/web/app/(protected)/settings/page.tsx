'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { Sun, Moon, Bell, Shield, LogOut, Monitor, Loader2 } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-[var(--bg-primary)]/60 border border-[var(--glass-border)]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="backdrop-blur-xl bg-[var(--bg-surface)]/80 border border-[var(--glass-border)] rounded-xl p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)] mb-5">
        {icon}
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const t = useTranslations('settings')
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  // Aparencia — conectado ao ThemeProvider global
  const { mode: themeMode, setTheme: applyTheme } = useTheme()
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(themeMode)
  const [language, setLanguage] = useState('pt-BR')

  // Sync Settings theme selection → global ThemeProvider
  useEffect(() => {
    if (theme === 'system') {
      const systemPref = window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
      applyTheme(systemPref)
    } else {
      applyTheme(theme)
    }
  }, [theme, applyTheme])

  // Notificacoes — persistidos via preferences JSONB
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)

  // Privacidade
  const [profileVisible, setProfileVisible] = useState(true)
  const [activityVisible, setActivityVisible] = useState(false)

  // Sessoes
  const [signingOut, setSigningOut] = useState(false)

  // Carregar preferencias reais do banco no mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const localeRes = await fetch('/api/user/locale')
        if (localeRes.ok) {
          const json = await localeRes.json()
          const loc = json.data?.locale || json.locale
          if (loc) setLanguage(loc)
        }
      } catch {
        // fallback — manter default
      }
      try {
        const prefsRes = await fetch('/api/user/preferences')
        if (prefsRes.ok) {
          const json = await prefsRes.json()
          const prefs = json.data || json
          if (prefs.email_notifications !== undefined) setEmailNotif(prefs.email_notifications)
          if (prefs.push_notifications !== undefined) setPushNotif(prefs.push_notifications)
          if (prefs.profile_visible !== undefined) setProfileVisible(prefs.profile_visible)
          if (prefs.activity_visible !== undefined) setActivityVisible(prefs.activity_visible)
        }
      } catch {
        // fallback — manter defaults
      }
    }
    loadPreferences()
  }, [])

  // Persistir preferencias quando mudam
  async function savePreference(key: string, value: boolean) {
    try {
      await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
    } catch {
      // silencioso — toggle visual já aplicou
    }
  }

  function toggleEmailNotif() {
    const next = !emailNotif
    setEmailNotif(next)
    savePreference('email_notifications', next)
  }

  function togglePushNotif() {
    const next = !pushNotif
    setPushNotif(next)
    savePreference('push_notifications', next)
  }

  function toggleProfileVisible() {
    const next = !profileVisible
    setProfileVisible(next)
    savePreference('profile_visible', next)
  }

  function toggleActivityVisible() {
    const next = !activityVisible
    setActivityVisible(next)
    savePreference('activity_visible', next)
  }

  // Persistir idioma
  async function handleLanguageChange(locale: string) {
    setLanguage(locale)
    try {
      await fetch('/api/user/locale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      })
      document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`
    } catch {
      // silencioso
    }
  }

  async function handleSignOutAll() {
    setSigningOut(true)
    try {
      await supabase.auth.signOut({ scope: 'global' })
      router.push('/login')
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('subtitle')}</p>
        </div>

        {/* Aparencia */}
        <Section title={t('appearance')} icon={<Sun className="w-5 h-5 text-amber-400" />}>
          <SettingRow label={t('theme')} description={t('themeDescription')}>
            <div className="flex items-center gap-1 bg-[var(--bg-primary)]/50 border border-[var(--glass-border)] rounded-lg p-1">
              {[
                {
                  value: 'light' as const,
                  icon: <Sun className="w-3.5 h-3.5" />,
                  label: t('themeLight'),
                },
                {
                  value: 'dark' as const,
                  icon: <Moon className="w-3.5 h-3.5" />,
                  label: t('themeDark'),
                },
                {
                  value: 'system' as const,
                  icon: <Monitor className="w-3.5 h-3.5" />,
                  label: t('themeSystem'),
                },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    theme === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label={t('language')} description={t('languageDescription')}>
            <select
              value={language}
              onChange={e => handleLanguageChange(e.target.value)}
              className="bg-[var(--bg-primary)]/50 border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="pt-BR">Português (BR)</option>
              <option value="en-US">English (US)</option>
              <option value="es">Español</option>
            </select>
          </SettingRow>
        </Section>

        {/* Notificacoes */}
        <Section title={t('notifications')} icon={<Bell className="w-5 h-5 text-blue-400" />}>
          <SettingRow label={t('emailNotifications')} description={t('emailNotificationsDesc')}>
            <Toggle enabled={emailNotif} onToggle={toggleEmailNotif} />
          </SettingRow>

          <SettingRow label={t('pushNotifications')} description={t('pushNotificationsDesc')}>
            <Toggle enabled={pushNotif} onToggle={togglePushNotif} />
          </SettingRow>
        </Section>

        {/* Privacidade */}
        <Section title={t('privacy')} icon={<Shield className="w-5 h-5 text-emerald-400" />}>
          <SettingRow label={t('profileVisible')} description={t('profileVisibleDesc')}>
            <Toggle enabled={profileVisible} onToggle={toggleProfileVisible} />
          </SettingRow>

          <SettingRow label={t('activityVisible')} description={t('activityVisibleDesc')}>
            <Toggle enabled={activityVisible} onToggle={toggleActivityVisible} />
          </SettingRow>
        </Section>

        {/* Sessoes */}
        <Section title={t('sessions')} icon={<LogOut className="w-5 h-5 text-red-400" />}>
          <SettingRow label={t('endAllSessions')} description={t('endAllSessionsDesc')}>
            <button
              onClick={handleSignOutAll}
              disabled={signingOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {signingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              {t('endSessions')}
            </button>
          </SettingRow>
        </Section>
      </div>
    </div>
  )
}
