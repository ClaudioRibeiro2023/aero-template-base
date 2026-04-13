import { ComingSoon } from '@/components/common/ComingSoon'

export const metadata = { title: 'ETL & Integração' }

const TITLES: Record<string, string> = {
  transform: 'Tratamento de Dados',
  validation: 'Validação',
  catalog: 'Catálogo de Dados',
  lineage: 'Linhagem de Dados',
  quality: 'Qualidade de Dados',
  profiling: 'Data Profiling',
  jobs: 'Jobs & Agendamentos',
  logs: 'Logs & Reprocesso',
}

export default function EtlPage({ params }: { params: { slug?: string[] } }) {
  const section = params.slug?.[0]
  const title = section ? TITLES[section] || 'ETL & Integração' : 'ETL & Integração'

  return (
    <ComingSoon
      title={title}
      description="O módulo ETL permitirá importar, transformar e validar dados de múltiplas fontes com rastreabilidade completa."
      backHref="/dashboard"
      backLabel="Voltar ao Dashboard"
    />
  )
}
