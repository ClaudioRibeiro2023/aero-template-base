import { ComingSoon } from '@/components/common/ComingSoon'

export const metadata = { title: 'Observabilidade' }

const TITLES: Record<string, string> = {
  metrics: 'Métricas',
  logs: 'Logs',
  health: 'Saúde do Sistema',
  'data-quality': 'Qualidade de Dados',
  traces: 'Rastreamento Distribuído',
  alerts: 'Configuração de Alertas',
}

export default function ObservabilityPage({ params }: { params: { slug?: string[] } }) {
  const section = params.slug?.[0]
  const title = section ? TITLES[section] || 'Observabilidade' : 'Observabilidade'

  return (
    <ComingSoon
      title={title}
      description="O módulo de observabilidade fornecerá métricas, logs estruturados, health checks e rastreamento distribuído."
      backHref="/dashboard"
      backLabel="Voltar ao Dashboard"
    />
  )
}
