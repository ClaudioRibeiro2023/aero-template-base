---
id: 'ADR-003'
title: 'Autenticação JWT + RBAC'
status: 'accepted'
date: '2024-12-16'
owners:
  - 'Equipe de Arquitetura'
tags:
  - 'segurança'
  - 'auth'
  - 'rbac'
  - 'supabase'
related:
  - 'ADR-001'
supersedes: null
superseded_by: null
---

# ADR-003: Autenticação JWT + RBAC

## 1. Contexto e Problema

O Template Platform requer um sistema de autenticação e autorização que atenda:

- **Segurança** - Proteção robusta contra ataques comuns
- **Escalabilidade** - Stateless para múltiplas instâncias
- **Integração** - Compatível com SSO corporativo
- **Granularidade** - Controle de acesso por funcionalidade
- **Auditoria** - Rastreabilidade de ações

> **Problema central:** Como implementar autenticação segura e escalável com controle de acesso granular?

## 2. Drivers de Decisão

- **DR1:** Segurança - Proteção contra ataques
- **DR2:** Escalabilidade - Suporte a múltiplas instâncias
- **DR3:** Integração - SSO e IdPs externos
- **DR4:** Developer Experience - Facilidade de uso

Priorização: DR1 > DR2 > DR3 > DR4

## 3. Decisão

> **Decidimos:** Implementar autenticação via Supabase Auth, usando JWT para autorização stateless, RLS para controle de acesso e RBAC via roles customizadas.

### Especificações

| Item           | Valor                                     | Arquivo de Referência    |
| -------------- | ----------------------------------------- | ------------------------ |
| Protocolo      | Supabase Auth (GoTrue)                    | -                        |
| Fluxo          | Email/Password + OAuth                    | `lib/supabase/client.ts` |
| Token          | JWT RS256                                 | -                        |
| IdP            | Supabase Auth                             | Supabase Dashboard       |
| Client Library | @supabase/supabase-js 2.x + @supabase/ssr | `package.json`           |

### Roles Implementadas

**Fonte:** `packages/shared/src/auth/types.ts:2`

```typescript
export type UserRole = 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'VIEWER'
```

| Role       | Descrição                     |
| ---------- | ----------------------------- |
| `ADMIN`    | Administrador - acesso total  |
| `GESTOR`   | Gestor - CRUD em módulos      |
| `OPERADOR` | Operador - operações diárias  |
| `VIEWER`   | Visualizador - apenas leitura |

### Fluxo de Autenticação

```
1. Usuário acessa aplicação
2. Middleware verifica sessão (supabase.auth.getUser)
3. Se não autenticado, redireciona para /login
4. Usuário autentica via Supabase Auth (email/password ou OAuth)
5. Supabase retorna session (access_token + refresh_token)
6. Middleware faz refresh automático de tokens
7. RLS no PostgreSQL garante acesso baseado em roles
```

### Escopo

- **Afeta:** Frontend (auth flow), API Routes (validação), Database (RLS)
- **Não afeta:** Lógica de negócio específica de módulos

## 4. Alternativas Consideradas

### Alternativa A: Session-based Auth

| Aspecto | Avaliação                                           |
| ------- | --------------------------------------------------- |
| Prós    | Revogação instantânea, menor superfície XSS         |
| Contras | Stateful, requer Redis compartilhado, CORS complexo |
| Esforço | Alto                                                |
| Risco   | Médio                                               |

**Por que descartada:** Complexidade de escalabilidade horizontal.

### Alternativa B: Auth0/Okta (SaaS)

| Aspecto | Avaliação                                                 |
| ------- | --------------------------------------------------------- |
| Prós    | Zero manutenção, features avançadas                       |
| Contras | Custo por usuário, vendor lock-in, dados em cloud externa |
| Esforço | Baixo                                                     |
| Risco   | Médio (dependência externa)                               |

**Por que descartada:** Requisitos de compliance podem impedir uso de SaaS externo.

### Alternativa C: JWT em localStorage

| Aspecto | Avaliação                            |
| ------- | ------------------------------------ |
| Prós    | Simples, persiste entre abas         |
| Contras | Vulnerável a XSS, OWASP desrecomenda |
| Esforço | Baixo                                |
| Risco   | Alto                                 |

**Por que descartada:** Risco de segurança inaceitável.

## 5. Consequências e Trade-offs

### Positivas

- ✅ Stateless - Escala horizontalmente sem estado compartilhado
- ✅ Padrão aberto - OIDC é amplamente documentado
- ✅ SSO ready - Integração com IdPs corporativos
- ✅ Self-hosted - Sem dependência de SaaS

### Negativas

- ⚠️ Dependência do Supabase como provedor de auth
- ⚠️ Revogação não instantânea (depende de TTL do JWT)
- ⚠️ RLS requer planejamento cuidadoso de policies

### Riscos Identificados

| Risco                         | Probabilidade | Impacto | Mitigação                       |
| ----------------------------- | ------------- | ------- | ------------------------------- |
| Token theft via XSS           | Baixa         | Alto    | CSP, tokens em httpOnly cookies |
| Supabase indisponível         | Baixa         | Alto    | Graceful degradation            |
| JWT expirado durante operação | Média         | Baixo   | Auto-refresh via middleware     |

## 6. Impacto em Integrações e Contratos

### Breaking Changes

- [x] Não (decisão fundacional)

### Contratos para Integradores

#### Obter Token (via Supabase Auth)

```bash
curl -X POST \
  "https://your-project.supabase.co/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -H "apikey: <anon_key>" \
  -d '{"email": "user@example.com", "password": "password"}'
```

#### Usar Token na API

```bash
curl -X GET "https://your-app.com/api/resource" \
  -H "Authorization: Bearer <access_token>"
```

#### Validar Token (JWKS)

```
GET https://your-project.supabase.co/auth/v1/.well-known/jwks.json
```

### Claims Obrigatórias no JWT

| Claim                | Tipo     | Descrição           |
| -------------------- | -------- | ------------------- |
| `sub`                | string   | ID único do usuário |
| `email`              | string   | E-mail              |
| `realm_access.roles` | string[] | Roles do usuário    |

### Documentação Completa

Ver: [Contrato de Autenticação](../contratos-integracao/auth.md)

## 7. Plano de Rollout/Migração

### Status

✅ **Implementado** - Sistema em uso.

### Configurações de Segurança Recomendadas

**Supabase Auth (Dashboard > Authentication > Settings):**

```yaml
JWT expiry: 3600 # 1 hora
Enable email confirmations: true
Minimum password length: 8
Enable brute force protection: true
```

### Evolução Futura

1. **MFA** - Adicionar autenticação multi-fator
2. **Passwordless** - WebAuthn/passkeys
3. **Fine-grained permissions** - Além de roles, permissões por recurso

## 8. Referências

### Internas

- [Contrato de Auth](../contratos-integracao/auth.md)
- [RBAC](../seguranca/rbac.md)
- [Headers de Segurança](../seguranca/headers-seguranca.md)

### Externas

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Auth Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## Histórico

| Data       | Autor                 | Mudança                                            |
| ---------- | --------------------- | -------------------------------------------------- |
| 2024-12-16 | Equipe de Arquitetura | Criação                                            |
| 2024-12-16 | Cascade               | Migração para ADR v2, adicionar seção de contratos |

---

_Migrado de `/docs/adr/003-autenticacao-jwt-rbac.md`_
