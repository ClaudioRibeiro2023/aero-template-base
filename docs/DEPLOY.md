# Guia de Deploy

Instruções para deploy do Template.Base v2.0 em diferentes plataformas.

## Variáveis de Ambiente

Antes de qualquer deploy, configure estas variáveis:

| Variável                        | Obrigatória | Descrição                            |
| ------------------------------- | ----------- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Sim         | URL do projeto Supabase              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim         | Chave anônima (pública) do Supabase  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Sim         | Chave de serviço (server-side only)  |
| `NEXT_PUBLIC_APP_NAME`          | Sim         | Nome exibido na aplicação            |
| `NEXT_PUBLIC_AUTH_PROVIDER`     | Não         | `supabase` (padrão) ou `keycloak`    |
| `NEXT_PUBLIC_DEMO_MODE`         | Não         | `true` para modo demonstração        |
| `NEXT_PUBLIC_PRIMARY_COLOR`     | Não         | Cor primária do branding (hex)       |
| `NEXT_PUBLIC_LOGO_URL`          | Não         | URL ou caminho do logo               |
| `KEYCLOAK_ISSUER`               | Condicional | URL do Keycloak (se auth = keycloak) |
| `KEYCLOAK_CLIENT_ID`            | Condicional | Client ID do Keycloak                |
| `KEYCLOAK_CLIENT_SECRET`        | Condicional | Client Secret do Keycloak            |

> **Segurança:** Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no cliente. Variáveis sem o prefixo `NEXT_PUBLIC_` ficam apenas no servidor.

## Vercel (Recomendado)

Vercel é a plataforma recomendada para deploy de aplicações Next.js.

### Passos

1. Conecte o repositório no [Vercel Dashboard](https://vercel.com)
2. Configure o **Root Directory** como `apps/web`
3. O **Build Command** será detectado automaticamente (`pnpm build`)
4. Adicione as variáveis de ambiente na aba **Settings > Environment Variables**
5. Faça o deploy

### Configuração manual via CLI

```bash
npm i -g vercel
vercel --prod
```

O `vercel.json` na raiz já configura o root directory e build settings.

## Netlify (Alternativa)

### Passos

1. Conecte o repositório no [Netlify Dashboard](https://netlify.com)
2. Configure:
   - **Base directory:** (raiz do repo)
   - **Build command:** `pnpm build`
   - **Publish directory:** `apps/web/.next`
3. Adicione as variáveis de ambiente em **Site settings > Environment variables**
4. Instale o plugin `@netlify/plugin-nextjs` para suporte ao App Router

### Configuração via CLI

```bash
npm i -g netlify-cli
netlify deploy --prod
```

## Supabase (Backend)

O backend roda inteiramente no Supabase Cloud. Não há servidor próprio para manter.

### Configuração do Projeto

1. Crie um projeto em [app.supabase.com](https://app.supabase.com)
2. Copie a URL e chaves do projeto (Settings > API)
3. Vincule o projeto local:

```bash
supabase link --project-ref <project-id>
```

### Aplicar Migrations

```bash
# Aplica todas as migrations pendentes
supabase db push
```

As 4 migrations criam: tenants, profiles, tabelas core e políticas RLS.

### Configurar Auth

No Supabase Dashboard:

1. **Authentication > Providers** — Habilite Email/Password
2. **Authentication > URL Configuration** — Configure Site URL e Redirect URLs
3. (Opcional) Habilite providers OAuth (Google, GitHub, etc.)

### Configurar Storage

Os buckets são criados automaticamente pelas migrations. Verifique em **Storage** no Dashboard:

- `avatars` — Público, limite 2MB
- `attachments` — Privado com RLS
- `public` — Público

## Docker (Self-Hosted)

Para deploy auto-hospedado:

```bash
cd infra
cp .env.example .env
# Edite .env com valores reais do Supabase
docker compose up -d
```

O `Dockerfile` em `apps/web/` faz build multi-stage otimizado para produção.

## Kubernetes

```bash
# Crie os secrets (nunca faça commit de valores reais)
kubectl create secret generic template-secrets \
  --from-env-file=infra/.env

# Aplique os manifests
kubectl apply -f infra/k8s/deployment.yaml
kubectl apply -f infra/k8s/autoscaling.yaml
```

## CI/CD Automático

O workflow `.github/workflows/supabase-migrate.yml` aplica migrations automaticamente ao push na branch `main`.

Para deploy automático do frontend:

- **Vercel:** Já configura auto-deploy ao conectar o repositório
- **Netlify:** Já configura auto-deploy ao conectar o repositório
- **Docker/K8s:** Configure o workflow `.github/workflows/deploy.yml`

## Checklist Pré-Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Migrations aplicadas no Supabase (`supabase db push`)
- [ ] Build de produção sem erros (`pnpm build`)
- [ ] Auth providers configurados no Supabase Dashboard
- [ ] Storage buckets verificados
- [ ] URL do site configurada no Supabase (Authentication > URL Configuration)
