import { ComingSoon } from '@/components/common/ComingSoon'

export const metadata = { title: 'Exportações' }

export default function ExportPage() {
  return (
    <ComingSoon
      title="Exportações"
      description="Central de download de dados em múltiplos formatos: CSV, Excel, PDF e JSON."
      backHref="/relatorios"
      backLabel="Voltar aos Relatórios"
    />
  )
}
