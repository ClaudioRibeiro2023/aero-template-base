# Supabase

## Schema

O template inclui 5 tabelas core em `supabase/migrations/`:

| Tabela          | Descricao                              | RLS                            |
| --------------- | -------------------------------------- | ------------------------------ |
| `tenants`       | Organizacoes/clientes                  | Isolamento por tenant          |
| `profiles`      | Perfis de usuario (extends auth.users) | Isolamento por tenant          |
| `admin_config`  | Branding, tema, navegacao por tenant   | Apenas admin/gestor            |
| `feature_flags` | Flags habilitaveis por tenant          | Leitura publica, escrita admin |
| `audit_logs`    | Log de acoes (append-only)             | Apenas admin                   |

## Auth

### Supabase Auth (padrao)

Login por email/senha com auto-criacao de perfil via trigger:

- `on_auth_user_created` → cria entrada em `profiles`
- Role padrao: `VIEWER`
- Roles disponiveis: `ADMIN`, `GESTOR`, `OPERADOR`, `VIEWER`

### Keycloak (opcional)

Configure em `supabase/config.toml`:

```toml
[auth.external.keycloak]
enabled = true
client_id = "seu-client-id"
secret = "seu-client-secret"
url = "https://keycloak.example.com/realms/seu-realm"
```

## Realtime

Wrapper em `@template/shared/realtime`:

```typescript
import { subscribeToTable } from '@template/shared/realtime'

// Escutar mudancas na tabela profiles
const channel = subscribeToTable('profiles', payload => {
  console.log('Mudanca:', payload)
})
```

Suporta: PostgreSQL Changes, Broadcast, Presence.

## Storage

Wrapper em `@template/shared/storage`:

```typescript
import { uploadFile, getSignedUrl } from '@template/shared/storage'

const result = await uploadFile(file, { bucket: 'attachments' })
const url = await getSignedUrl('attachments', result.path)
```

Buckets padrao: `avatars`, `attachments`, `public`.

## RLS Policies

Todas tabelas usam RLS com helper functions:

- `get_user_tenant_id()` — extrai tenant do JWT
- `get_user_role()` — extrai role do JWT ou profile
- `is_admin_or_gestor()` — check de permissao

## Migrations

```bash
# Criar nova migration
supabase migration new nome_da_migration

# Aplicar localmente
supabase db reset

# Aplicar em producao
supabase db push
```
