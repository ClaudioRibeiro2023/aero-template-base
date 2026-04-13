import { ComingSoon } from '@/components/common/ComingSoon'

export const metadata = { title: 'Histórico de Qualidade' }

export default function QualityHistoryPage() {
  return (
    <ComingSoon
      title="Histórico de Qualidade"
      description="Acompanhe a evolução dos scores de qualidade ao longo do tempo com gráficos e comparativos."
      backHref="/admin/quality"
      backLabel="Voltar à Qualidade"
    />
  )
}
