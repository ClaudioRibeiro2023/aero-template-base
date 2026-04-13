import { ComingSoon } from '@/components/common/ComingSoon'

export const metadata = { title: 'Documentação' }

const TITLES: Record<string, string> = {
  guias: 'Guias e Tutoriais',
  api: 'Referência da API',
  arquitetura: 'Arquitetura (ADRs)',
  changelog: 'Changelog',
  faq: 'Perguntas Frequentes',
}

export default function DocsPage({ params }: { params: { slug?: string[] } }) {
  const section = params.slug?.[0]
  const title = section ? TITLES[section] || 'Documentação' : 'Documentação'

  return (
    <ComingSoon
      title={title}
      description="A documentação completa da plataforma está sendo elaborada. Em breve você encontrará guias, tutoriais e referências técnicas."
      backHref="/dashboard"
      backLabel="Voltar ao Dashboard"
    />
  )
}
