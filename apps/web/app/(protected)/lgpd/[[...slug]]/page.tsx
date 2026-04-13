import { ComingSoon } from '@/components/common/ComingSoon'

export const metadata = { title: 'LGPD & Privacidade' }

const TITLES: Record<string, string> = {
  consentimento: 'Gerenciar Consentimento',
  'meus-dados': 'Meus Dados Pessoais',
  cookies: 'Preferências de Cookies',
  solicitacoes: 'Solicitações de Titulares',
  auditoria: 'Auditoria LGPD',
}

export default function LgpdPage({ params }: { params: { slug?: string[] } }) {
  const section = params.slug?.[0]
  const title = section ? TITLES[section] || 'LGPD & Privacidade' : 'Política de Privacidade'

  return (
    <ComingSoon
      title={title}
      description="O módulo de compliance LGPD permitirá gerenciar consentimento, exportar dados pessoais e acompanhar solicitações de titulares."
      backHref="/dashboard"
      backLabel="Voltar ao Dashboard"
    />
  )
}
