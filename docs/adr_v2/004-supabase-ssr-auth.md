---
id: 'ADR-004'
title: 'Autenticação via Supabase Auth + @supabase/ssr'
status: 'accepted'
date: '2026-03-30'
owners:
  - 'Equipe de Arquitetura'
tags:
  - 'segurança'
  - 'auth'
  - 'supabase'
  - 'ssr'
  - 'middleware'
related:
  - 'ADR-003'
supersedes: null
superseded_by: null
---

# ADR-004: Autenticação via Supabase Auth + @supabase/ssr

## 1. Contexto e Problema

O template.base v1 e v2.0 utilizavam Keycloak + `oidc-client-ts` como solução de autenticação. Essa abordagem gerava os seguintes problemas operacionais e de segurança:

- **Infraestrutura extra** — Keycloak requer um container dedicado (RAM mínimo 512 MB), adicionando complexidade ao `docker-compose.yml` e ao pipeline de CI/CD
- **Cookies frágeis** — O parsing manual de cookies no middleware era propenso a falhas em edge cases (cookies SameSite, preflight requests)
- **Sem auto-refresh** — A renovação do access token exigia lógica customizada no cliente, gerando janelas de sessão expirada sem feedback adequado ao usuário
- **Cross-tenant injection** — `audit_logs` inseridos server-side não tinham o `user_id` preenchido corretamente quando o contexto de autenticação vinha de fontes distintas (API Routes vs. Server Actions)

> **Problema central:** Como simplificar a camada de autenticação, eliminar a dependência do Keycloak e garantir integração segura com RLS do Supabase em todos os contextos de execução (middleware, Server Components, API Routes, Server Actions)?

## 2. Drivers de Decisão

- **DR1:** Segurança — `getUser()` valida o token contra o servidor Supabase a cada request server-side (sem confiança cega no JWT local)
- **DR2:** Simplicidade operacional — Zero infraestrutura adicional além do Supabase já utilizado para o banco de dados
- **DR3:** Integração com RLS — `auth.uid()` disponível automaticamente nas policies do PostgreSQL
- **DR4:** Developer Experience — API consistente entre middleware, Server Components e Client Components

Priorização: DR1 > DR2 > DR3 > DR4

## 3. Decisão

> **Decidimos:** Adotar Supabase Auth com `@supabase/ssr` para gestão de sessões server-side via cookies. O middleware usa `createServerClient` com os handlers `getAll`/`setAll`. Toda validação server-side usa `getUser()` (não `getSession()`).

### Especificações

| Item              | Valor                                      | Arquivo de Referência     |
| ----------------- | ------------------------------------------ | ------------------------- |
| Biblioteca client | `@supabase/supabase-js` 2.x                | `package.json`            |
| Biblioteca SSR    | `@supabase/ssr` 0.5.x                      | `package.json`            |
| Middleware        | `createServerClient` com `getAll`/`setAll` | `src/middleware.ts`       |
| Server-side       | `createServerClient` via `cookies()`       | `lib/supabase/server.ts`  |
| Client-side       | `createBrowserClient`                      | `lib/supabase/client.ts`  |
| Validação segura  | `supabase.auth.getUser()`                  | Todas as rotas protegidas |
| Fluxo             | Email/Password + OAuth providers           | Supabase Dashboard        |

### Padrão de Implementação

**Middleware (`src/middleware.ts`):**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: usar getUser(), nunca getSession() server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

**Server Component / Server Action (`lib/supabase/server.ts`):**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
}
```

### Por que `getUser()` e não `getSession()`

`getSession()` retorna a sessão do cookie sem validação server-side — um cookie adulterado seria aceito. `getUser()` faz uma chamada à API do Supabase a cada request, garantindo que o token é válido. Em Server Components e middleware, **sempre** usar `getUser()`.

### Escopo

- **Afeta:** Middleware, Server Components, API Routes, Server Actions, Client Components com sessão
- **Não afeta:** Lógica de negócio específica de módulos, definição de roles (ver ADR-003)

## 4. Alternativas Consideradas

### Alternativa A: NextAuth.js (Auth.js v5)

| Aspecto | Avaliação                                                                  |
| ------- | -------------------------------------------------------------------------- |
| Prós    | Multi-provider nativo, não acopla ao Supabase, mais flexível               |
| Contras | Mais configuração, adapter necessário para Supabase, RLS requer JWT custom |
| Esforço | Alto                                                                       |
| Risco   | Médio (integração com RLS exige custom JWT hook no Supabase)               |

**Por que descartada:** A integração com RLS do Supabase requer um JWT hook customizado que replica parte do que `@supabase/ssr` faz nativamente. Custo de configuração sem benefício real para o contexto.

### Alternativa B: Clerk

| Aspecto | Avaliação                                                               |
| ------- | ----------------------------------------------------------------------- |
| Prós    | UX de auth premium out-of-the-box, MFA, passkeys, UI pronta             |
| Contras | SaaS pago (custo por MAU), vendor lock-in, dados de usuários fora do DB |
| Esforço | Baixo                                                                   |
| Risco   | Médio (dependência de terceiro para dado crítico)                       |

**Por que descartada:** Custo adicional (MAU-based) e dados de usuários em infraestrutura externa ao Supabase.

### Alternativa C: Auth0

| Aspecto | Avaliação                                                          |
| ------- | ------------------------------------------------------------------ |
| Prós    | Solução enterprise madura, compliance, SAML/LDAP nativo            |
| Contras | Custo por MAU, complexidade de setup, dados fora do Supabase       |
| Esforço | Alto                                                               |
| Risco   | Baixo (solução consolidada), mas custo elevado para projetos novos |

**Por que descartada:** Overhead de custo e configuração desproporcional para o perfil dos projetos gerados pelo template.

### Alternativa D: Manter Keycloak

| Aspecto | Avaliação                                                          |
| ------- | ------------------------------------------------------------------ |
| Prós    | Solução enterprise completa, SAML, LDAP, fine-grained permissions  |
| Contras | Container extra, alta complexidade operacional, sem integração RLS |
| Esforço | Alto (manutenção contínua)                                         |
| Risco   | Alto (infraestrutura frágil, cookie parsing manual)                |

**Por que descartada:** Complexidade operacional desproporcional; os problemas identificados no contexto são inerentes à abordagem.

## 5. Consequências e Trade-offs

### Positivas

- ✅ Zero infraestrutura adicional — Supabase Auth já está disponível no projeto
- ✅ Auto-refresh de tokens gerenciado pelo `@supabase/ssr` sem código customizado
- ✅ `auth.uid()` disponível diretamente nas policies RLS sem configuração extra
- ✅ Contexto de autenticação consistente entre middleware, Server Components e API Routes
- ✅ Eliminação do Keycloak container reduz tempo de setup local em ~2 min
- ✅ `audit_logs.user_id` preenchido corretamente em todos os contextos server-side

### Negativas

- ⚠️ Acoplamento ao Supabase Auth — trocar de provedor exige refactor do middleware e dos utilitários `lib/supabase/`
- ⚠️ Funcionalidades enterprise (SAML, LDAP, fine-grained permissions) requerem integração adicional ou troca de provedor
- ⚠️ `getUser()` faz uma chamada de rede por request server-side (latência adicional ~20-50ms vs. `getSession()` local)

### Riscos Identificados

| Risco                               | Probabilidade | Impacto | Mitigação                                       |
| ----------------------------------- | ------------- | ------- | ----------------------------------------------- |
| Supabase Auth indisponível          | Baixa         | Alto    | Graceful degradation + página de manutenção     |
| Breaking changes em `@supabase/ssr` | Baixa         | Médio   | Fixar versão no `package.json`, changelog watch |
| Cookie overflow (muitos providers)  | Baixa         | Baixo   | Monitorar tamanho do cookie de sessão           |

## 6. Impacto em Integrações e Contratos

### Breaking Changes (em relação ao v2.0 com Keycloak)

- [x] **Remoção do Keycloak** — `docker-compose.yml` não inclui mais container Keycloak
- [x] **Remoção do `oidc-client-ts`** — dependência removida do `package.json`
- [x] **Mudança no middleware** — substituição completa da lógica de parsing de cookies
- [x] **Variáveis de ambiente** — `KEYCLOAK_*` substituídas por `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Contratos para Integradores

#### Verificar Sessão Atual (Client Component)

```typescript
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const {
  data: { user },
} = await supabase.auth.getUser()
```

#### Obter Sessão em Server Action

```typescript
import { createClient } from '@/lib/supabase/server'

export async function minhaAction() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Não autorizado')
  // ...
}
```

#### Variáveis de Ambiente Obrigatórias

| Variável                        | Tipo   | Descrição                      |
| ------------------------------- | ------ | ------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | string | URL do projeto Supabase        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | string | Chave anon pública do Supabase |

## 7. Plano de Rollout/Migração

### Status

✅ **Implementado** — Aplicado no template.base v2.1 (2026-03-30).

### Migração de v2.0 (Keycloak) para v2.1 (Supabase Auth)

```bash
# 1. Remover dependências legadas
npm uninstall oidc-client-ts keycloak-js

# 2. Instalar dependências novas
npm install @supabase/ssr@latest

# 3. Substituir middleware (ver padrão de implementação acima)
# 4. Criar lib/supabase/server.ts e lib/supabase/client.ts
# 5. Remover variáveis KEYCLOAK_* do .env
# 6. Adicionar NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
# 7. Remover serviço keycloak do docker-compose.yml
```

### Evolução Futura

1. **MFA** — Ativar via Supabase Dashboard (Authenticator App + SMS)
2. **Passkeys/WebAuthn** — Suportado pelo Supabase Auth v2.x
3. **SSO SAML** — Disponível no plano Pro do Supabase para integrações corporativas
4. **Magic Link / OTP** — Configurável sem código adicional

## 8. Referências

### Internas

- [ADR-003: Autenticação JWT + RBAC](./003-autenticacao-jwt-rbac.md)
- [Contrato de Auth](../contratos-integracao/auth.md)
- [Setup Local](../operacao/setup-local.md)

### Externas

- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Creating a Supabase client for SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [@supabase/ssr npm package](https://www.npmjs.com/package/@supabase/ssr)

---

## Histórico

| Data       | Autor        | Mudança                                                           |
| ---------- | ------------ | ----------------------------------------------------------------- |
| 2026-03-30 | Aero Factory | Criação — migração de Keycloak para Supabase Auth + @supabase/ssr |

---

_ADR criada no Sprint 8 do Megaplan Template.Base v2.1_
