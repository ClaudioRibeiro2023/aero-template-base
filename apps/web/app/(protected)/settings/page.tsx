'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import { Sun, Moon, Bell, Shield, LogOut, Monitor, Loader2 } from 'lucide-react'

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
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  // Aparencia
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [language, setLanguage] = useState('pt-BR')

  // Notificacoes
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)

  // Privacidade
  const [profileVisible, setProfileVisible] = useState(true)
  const [activityVisible, setActivityVisible] = useState(false)

  // Sessoes
  const [signingOut, setSigningOut] = useState(false)

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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Configurações</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Gerencie suas preferências pessoais
          </p>
        </div>

        {/* Aparencia */}
        <Section title="Aparência" icon={<Sun className="w-5 h-5 text-amber-400" />}>
          <SettingRow label="Tema" description="Escolha o modo de exibição">
            <div className="flex items-center gap-1 bg-[var(--bg-primary)]/50 border border-[var(--glass-border)] rounded-lg p-1">
              {[
                { value: 'light' as const, icon: <Sun className="w-3.5 h-3.5" />, label: 'Claro' },
                { value: 'dark' as const, icon: <Moon className="w-3.5 h-3.5" />, label: 'Escuro' },
                {
                  value: 'system' as const,
                  icon: <Monitor className="w-3.5 h-3.5" />,
                  label: 'Sistema',
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

          <SettingRow label="Idioma" description="Idioma da interface">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="bg-[var(--bg-primary)]/50 border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <option value="pt-BR">Português (BR)</option>
              <option value="en-US">English (US)</option>
              <option value="es">Español</option>
            </select>
          </SettingRow>
        </Section>

        {/* Notificacoes */}
        <Section title="Notificações" icon={<Bell className="w-5 h-5 text-blue-400" />}>
          <SettingRow
            label="Notificações por e-mail"
            description="Receba atualizações no seu e-mail"
          >
            <Toggle enabled={emailNotif} onToggle={() => setEmailNotif(!emailNotif)} />
          </SettingRow>

          <SettingRow label="Notificações push" description="Receba alertas no navegador">
            <Toggle enabled={pushNotif} onToggle={() => setPushNotif(!pushNotif)} />
          </SettingRow>
        </Section>

        {/* Privacidade */}
        <Section title="Privacidade" icon={<Shield className="w-5 h-5 text-emerald-400" />}>
          <SettingRow label="Perfil visível" description="Outros usuários podem ver seu perfil">
            <Toggle enabled={profileVisible} onToggle={() => setProfileVisible(!profileVisible)} />
          </SettingRow>

          <SettingRow
            label="Log de atividade visível"
            description="Mostrar suas atividades recentes"
          >
            <Toggle
              enabled={activityVisible}
              onToggle={() => setActivityVisible(!activityVisible)}
            />
          </SettingRow>
        </Section>

        {/* Sessoes */}
        <Section title="Sessões" icon={<LogOut className="w-5 h-5 text-red-400" />}>
          <SettingRow
            label="Encerrar todas as sessões"
            description="Desconecta de todos os dispositivos, incluindo este"
          >
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
              Encerrar sessões
            </button>
          </SettingRow>
        </Section>
      </div>
    </div>
  )
}
