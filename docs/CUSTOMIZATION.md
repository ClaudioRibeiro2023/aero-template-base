# Guia de Customização

Como adaptar o Template.Base v2.0 para o seu projeto — branding, temas, navegação e módulos.

## Branding

### Via Variáveis de Ambiente

A forma mais rápida de customizar é via `.env.local`:

```env
NEXT_PUBLIC_APP_NAME=Minha Aplicação
NEXT_PUBLIC_LOGO_URL=/logos/meu-logo.svg
NEXT_PUBLIC_PRIMARY_COLOR=#6366f1
NEXT_PUBLIC_SECONDARY_COLOR=#7c3aed
```

Essas variáveis são lidas pelo `BrandingProvider` e aplicadas automaticamente em toda a aplicação.

### Via Painel Administrativo

Usuários com role `ADMIN` podem alterar branding em tempo real pelo painel:

- **Configurações > Branding** — Nome, logo, cores, favicon
- As mudanças são salvas no tenant e aplicadas via `TenantBranding` provider
- Cada tenant pode ter branding próprio (multi-tenancy)

## Temas e Dark Mode

### CSS Variables

As cores do tema ficam em `apps/web/styles/globals.css`:

```css
:root {
  --brand-primary: #14b8a6;
  --brand-secondary: #0e7490;
  --brand-accent: #2dd4bf;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
}

[data-theme='dark'] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
}
```

Para alterar o tema, edite estas variáveis. Todos os componentes do design system as utilizam.

### Dark Mode

O dark mode é detectado automaticamente via `prefers-color-scheme`. O usuário também pode alternar manualmente pelo toggle no header.

A lógica está no `ThemeContext` (`apps/web/contexts/`):

```tsx
const { theme, toggleTheme } = useTheme()
// theme: 'light' | 'dark' | 'system'
```

## Navegação

### Configuração do AppSidebar

A navegação padrão está em `apps/web/config/navigation-default.ts` com 4 seções core:

| Seção         | Ícone           | Descrição                        |
| ------------- | --------------- | -------------------------------- |
| Dashboard     | LayoutDashboard | Página inicial com métricas      |
| Relatórios    | BarChart        | Visualizações e exportações      |
| Configurações | Settings        | Configurações do tenant e perfil |
| Administração | Shield          | Gestão de usuários e roles       |

### Adicionando Novas Rotas

1. Crie a página em `apps/web/app/(dashboard)/minha-rota/page.tsx`
2. Adicione a entrada de navegação em `config/navigation-default.ts`:

```typescript
{
  label: 'Minha Rota',
  href: '/minha-rota',
  icon: 'FileText',
  roles: ['ADMIN', 'GESTOR'], // roles permitidas
}
```

3. A rota aparecerá automaticamente no sidebar para usuários com as roles corretas.

## Módulos

Módulos são funcionalidades plugáveis registradas dinamicamente.

### Criando um Novo Módulo

Use o gerador:

```bash
pnpm create-module meu-modulo
```

O gerador cria a estrutura:

```
apps/web/app/modules/meu-modulo/
  ├── page.tsx           # Página principal
  ├── components/        # Componentes do módulo
  ├── hooks/             # Hooks específicos
  └── index.ts           # Exportações (routes, nav items)
```

### Registrando o Módulo

O módulo é registrado automaticamente pelo gerador em `apps/web/config/module-registry.ts`:

```typescript
export const modules = [
  // ... módulos existentes
  {
    name: 'meu-modulo',
    label: 'Meu Módulo',
    routes: ['/modules/meu-modulo'],
    icon: 'Package',
    roles: ['ADMIN', 'GESTOR', 'OPERADOR'],
  },
]
```

## Internacionalização (i18n)

### Estrutura de Traduções

```
apps/web/i18n/
  ├── pt-BR/
  │   ├── common.json    # Termos globais (botões, labels)
  │   ├── auth.json      # Tela de login e registro
  │   └── dashboard.json # Textos do dashboard
  └── en-US/
      ├── common.json
      ├── auth.json
      └── dashboard.json
```

### Adicionando um Novo Idioma

1. Crie a pasta `apps/web/i18n/es-ES/` (exemplo: Espanhol)
2. Copie os arquivos JSON de `pt-BR/` como base
3. Traduza os valores (mantenha as chaves em inglês)
4. Registre o idioma no arquivo de configuração do i18n:

```typescript
// apps/web/i18n/config.ts
export const supportedLocales = ['pt-BR', 'en-US', 'es-ES']
export const defaultLocale = 'pt-BR'
```

### Usando Traduções em Componentes

```tsx
import { useTranslation } from 'react-i18next'

function MeuComponente() {
  const { t } = useTranslation('common')
  return <h1>{t('welcome')}</h1>
}
```

## Roles e Permissões

4 roles padrão configuráveis via Supabase:

| Role       | Nível    | Descrição                          |
| ---------- | -------- | ---------------------------------- |
| `ADMIN`    | Total    | Acesso completo, gestão de tenants |
| `GESTOR`   | Gestão   | Configurações e gestão de usuários |
| `OPERADOR` | Operação | Funcionalidades do dia a dia       |
| `VIEWER`   | Leitura  | Apenas visualização de dados       |

### Proteger Rotas no Frontend

```tsx
<ProtectedRoute requiredRoles={['ADMIN', 'GESTOR']}>
  <MinhaPage />
</ProtectedRoute>
```

### Proteger API Routes

```typescript
// app/api/minha-rota/route.ts
import { requireRole } from '@template/shared/auth'

export async function GET(req: Request) {
  const user = await requireRole(req, ['ADMIN'])
  // ... lógica protegida
}
```
