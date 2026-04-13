import { ComingSoon } from '@/components/common/ComingSoon'

export const metadata = { title: 'Perfis e Roles' }

export default function PerfisPage() {
  return (
    <ComingSoon
      title="Perfis e Roles"
      description="Gerencie perfis de acesso, roles e permissões granulares para cada usuário da plataforma."
      backHref="/admin/usuarios"
      backLabel="Voltar a Usuários"
    />
  )
}
