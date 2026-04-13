import { ComingSoon } from '@/components/common/ComingSoon'

export const metadata = { title: 'Entidades' }

export default function EntidadesPage() {
  return (
    <ComingSoon
      title="Entidades"
      description="Gerencie organizações, unidades operacionais e estrutura hierárquica do sistema."
      backHref="/dashboard"
      backLabel="Voltar ao Dashboard"
    />
  )
}
