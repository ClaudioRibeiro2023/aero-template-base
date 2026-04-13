# Guia de Bootstrap — Criando uma Nova App a partir do Template

> **Versao:** 1.0.0 | **Data:** Abril 2026

Guia completo e passo a passo para criar uma nova aplicacao a partir do Template.Base. Ao final deste guia, voce tera uma app funcional, com autenticacao, sistema modular e pronta para deploy.

---

## Pre-requisitos

| Ferramenta     | Versao Minima | Verificar                            |
| -------------- | ------------- | ------------------------------------ |
| Node.js        | 20+           | `node --version`                     |
| pnpm           | 9+            | `pnpm --version`                     |
| Git            | 2.x           | `git --version`                      |
| Supabase CLI   | 1.x           | `supabase --version`                 |
| Conta Supabase | —             | [supabase.com](https://supabase.com) |

---

## Passo 1: Copiar o Template

### Opcao A — Clone direto (recomendado)

```bash
git clone <repo-url-do-template> minha-nova-app
cd minha-nova-app

# Remover historico do template e iniciar limpo
rm -rf .git
git init
git add -A
git commit -m "feat: bootstrap a partir do template.base"
```

### Opcao B — Copiar manualmente

```bash
cp -r /caminho/para/template.base minha-nova-app
cd minha-nova-app
rm -rf node_modules .next apps/web/.next
git init
```

> **Importante:** Nunca trabalhe diretamente no `template.base`. Sempre copie e adapte.

---

## Passo 2: Instalar Dependencias

```bash
pnpm install
```

O monorepo usa Turborepo. O `pnpm install` resolve todos os workspaces:

- `apps/web` — Aplicacao Next.js 14 (App Router)
- `packages/design-system` — Componentes UI canonicos
- `packages/shared` — Auth adapter, Supabase client, utilitarios
- `packages/types` — TypeScript types compartilhados
- `packages/modules` — Sistema modular (manifests, resolver, registry)

---

## Passo 3: Configurar Variaveis de Ambiente

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edite o `apps/web/.env.local` com os valores do seu projeto:

### Variaveis Obrigatorias

| Variavel                        | Descricao                      | Onde encontrar                      |
| ------------------------------- | ------------------------------ | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL do projeto Supabase        | Dashboard Supabase > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anonima (publica)        | Dashboard Supabase > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY`     | Chave de servico (server-only) | Dashboard Supabase > Settings > API |

### Identidade da App

| Variavel                      | Descricao            | Exemplo        |
| ----------------------------- | -------------------- | -------------- |
| `NEXT_PUBLIC_APP_NAME`        | Nome exibido na UI   | `Aero Finance` |
| `NEXT_PUBLIC_APP_VERSION`     | Versao da app        | `1.0.0`        |
| `NEXT_PUBLIC_PRIMARY_COLOR`   | Cor primaria (hex)   | `#14b8a6`      |
| `NEXT_PUBLIC_SECONDARY_COLOR` | Cor secundaria (hex) | `#0e7490`      |
| `NEXT_PUBLIC_LOGO_URL`        | Caminho do logo      | `/logo.png`    |

### Tema (Gradientes)

| Variavel                      | Descricao                                                        |
| ----------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_GRADIENT_COLORS` | Cores do gradiente da tela de login (CSS, separadas por virgula) |
| `NEXT_PUBLIC_AMBIENT_COLOR_1` | Cor ambient 1 da area interna (rgba)                             |
| `NEXT_PUBLIC_AMBIENT_COLOR_2` | Cor ambient 2 da area interna (rgba)                             |
| `NEXT_PUBLIC_AMBIENT_COLOR_3` | Cor ambient 3 da area interna (rgba)                             |

### Auth Provider

| Variavel                    | Descricao                | Opcoes                            |
| --------------------------- | ------------------------ | --------------------------------- |
| `NEXT_PUBLIC_AUTH_PROVIDER` | Provider de autenticacao | `supabase` (padrao) ou `keycloak` |

Se usar Keycloak, configure tambem:

- `NEXT_PUBLIC_KEYCLOAK_URL`
- `NEXT_PUBLIC_KEYCLOAK_REALM`
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`

### Opcionais

| Variavel                 | Descricao                                           |
| ------------------------ | --------------------------------------------------- |
| `DEMO_MODE`              | `true` para modo demo sem Supabase (dados mockados) |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN do Sentry para monitoramento de erros           |

---

## Passo 4: Escolher Modulos

Edite o arquivo `apps/web/modules.config.ts` para definir quais modulos estarao ativos:

```ts
import type { ModuleOverride } from '@template/modules'

export const moduleOverrides: Record<string, ModuleOverride> = {
  // Default (ativos por padrao) ─────────────────────────
  dashboard: { enabled: true },
  reports: { enabled: true },

  // Opcionais ────────────────────────────────────────────
  tasks: { enabled: true }, // Gerenciamento de tarefas
  support: { enabled: false }, // Modulo de suporte/tickets
  notifications: { enabled: true }, // Central de notificacoes
  'feature-flags': { enabled: true }, // Feature flags via Supabase
  organizations: { enabled: false }, // Multi-tenant (organizacoes)

  // Utilitarios ──────────────────────────────────────────
  'file-upload': { enabled: true }, // Upload de arquivos
}
```

**Regras importantes:**

- Modulos **core** (auth, admin, settings, search) sao sempre ativos — nao podem ser desabilitados
- Modulos **default** vem ativos, mas podem ser desabilitados
- Modulos **optional** vem inativos e devem ser habilitados explicitamente
- Dependencias sao validadas automaticamente no startup

> Para mais detalhes sobre o sistema modular, veja [MODULES.md](./MODULES.md).

---

## Passo 5: Aplicar Migrations no Supabase

```bash
# Aplica todas as migrations SQL
pnpm db:migrate

# Gera tipos TypeScript a partir do schema atual
pnpm db:types
```

As migrations estao em `supabase/migrations/` e incluem tabelas, RLS policies e triggers necessarios.

---

## Passo 6: Rodar em Desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Verificar que tudo funciona

1. **Tela de login** — deve carregar com o branding configurado
2. **Criar conta** — registre um usuario de teste
3. **Dashboard** — apos login, o dashboard deve renderizar
4. **Sidebar** — apenas modulos habilitados devem aparecer no menu

### Modo Demo (sem Supabase)

Se ainda nao tem um projeto Supabase configurado:

```env
DEMO_MODE=true
```

O modo demo usa dados mockados e autenticacao simulada. Ideal para explorar a interface.

---

## Passo 7: Validar Build

Antes de qualquer deploy, **sempre** valide localmente:

```bash
# Verificacao de tipos
pnpm typecheck

# Lint
pnpm lint

# Testes
pnpm test:run

# Build de producao
pnpm build
```

> **Regra inegociavel:** Nunca faca push/deploy sem validar o build localmente.

---

## Passo 8: Deploy

### Vercel (recomendado)

1. Conecte o repositorio ao Vercel
2. Configure as variaveis de ambiente no dashboard
3. O Vercel detecta automaticamente o monorepo Turborepo
4. Root Directory: `apps/web`

### Docker

```bash
cd infra
docker-compose up -d
```

Para mais detalhes, consulte [DEPLOY.md](./DEPLOY.md).

---

## Checklist de Bootstrap

Use este checklist para confirmar que tudo foi configurado:

- [ ] Template copiado e `.git` reinicializado
- [ ] `pnpm install` executado sem erros
- [ ] `.env.local` configurado com variaveis do Supabase
- [ ] `modules.config.ts` revisado (modulos desejados habilitados)
- [ ] Migrations aplicadas (`pnpm db:migrate`)
- [ ] `pnpm dev` funciona e login renderiza
- [ ] `pnpm build` passa sem erros
- [ ] Commit inicial feito

---

## Comandos Uteis

| Comando              | Descricao                    |
| -------------------- | ---------------------------- |
| `pnpm dev`           | Servidor de desenvolvimento  |
| `pnpm build`         | Build de producao            |
| `pnpm typecheck`     | Verificacao de tipos         |
| `pnpm lint`          | ESLint                       |
| `pnpm test`          | Testes (watch mode)          |
| `pnpm test:run`      | Testes (CI, uma execucao)    |
| `pnpm db:migrate`    | Aplicar migrations Supabase  |
| `pnpm db:types`      | Gerar tipos do schema        |
| `pnpm create-module` | Scaffold de novo modulo      |
| `pnpm storybook`     | Storybook do design system   |
| `pnpm clean`         | Limpar node_modules e builds |

---

## Proximos Passos

- [MODULES.md](./MODULES.md) — Guia completo do sistema modular
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Arquitetura e padroes
- [CUSTOMIZATION.md](./CUSTOMIZATION.md) — Branding, temas, personalizacao
- [DEPLOY.md](./DEPLOY.md) — Deploy em producao
- [SUPABASE.md](./SUPABASE.md) — Integracao com Supabase

---

_Criado em Abril 2026 como parte do Sprint 7: Bootstrap Guide + Module Documentation_
