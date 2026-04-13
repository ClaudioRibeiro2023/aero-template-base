import { ComingSoon } from '@/components/common/ComingSoon'

export const metadata = { title: 'Relatórios Operacionais' }

export default function RelatoriosOperacionaisPage() {
  return (
    <ComingSoon
      title="Relatórios Operacionais"
      description="Relatórios de operação detalhados com métricas de execução, SLAs e indicadores de performance operacional."
      backHref="/relatorios"
      backLabel="Voltar aos Relatórios"
    />
  )
}
