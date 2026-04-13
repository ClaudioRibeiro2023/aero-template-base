import { ComingSoon } from '@/components/common/ComingSoon'

export const metadata = { title: 'Módulo Exemplo' }

const TITLES: Record<string, string> = {
  novo: 'Novo Registro',
  mapa: 'Visualização Espacial',
  graficos: 'Análises Visuais',
}

export default function ExemploPage({ params }: { params: { slug?: string[] } }) {
  const section = params.slug?.[0]
  const title = section ? TITLES[section] || 'Módulo Exemplo' : 'Módulo Exemplo'

  return (
    <ComingSoon
      title={title}
      description="Este módulo de exemplo demonstra a estrutura de navegação da plataforma. Personalize-o para sua necessidade."
      backHref="/dashboard"
      backLabel="Voltar ao Dashboard"
    />
  )
}
