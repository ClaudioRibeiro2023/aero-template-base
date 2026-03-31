# C4 Model - Nível 1: Context Diagram

> Visão de alto nível do sistema Template Platform e suas interações externas.

## Diagrama de Contexto

```mermaid
C4Context
    title System Context Diagram - Template Platform

    Person(user, "Usuário", "Usuário final da aplicação")
    Person(admin, "Administrador", "Administrador do sistema")
    Person(integrador, "Sistema Integrador", "Aplicações externas que consomem a API")

    System(templatePlatform, "Template Platform", "Plataforma web corporativa com autenticação, RBAC e módulos extensíveis")

    System_Ext(supabase, "Supabase", "Backend-as-a-Service - Auth, DB, Realtime, Storage")
    System_Ext(redis, "Redis", "Cache e sessões distribuídas (opcional)")
    System_Ext(smtp, "SMTP Server", "Envio de e-mails (opcional)")

    Rel(user, templatePlatform, "Acessa via browser", "HTTPS")
    Rel(admin, templatePlatform, "Gerencia usuários e configurações", "HTTPS")
    Rel(integrador, templatePlatform, "Consome API Routes", "HTTPS + JWT")

    Rel(templatePlatform, supabase, "Autentica e persiste dados", "HTTPS")
    Rel(templatePlatform, redis, "Cache e sessões", "TCP/6379")
    Rel(templatePlatform, smtp, "Envia notificações", "SMTP")
```

## Descrição dos Elementos

### Atores

| Ator                   | Descrição                                     | Interação                |
| ---------------------- | --------------------------------------------- | ------------------------ |
| **Usuário**            | Usuário final que acessa a aplicação web      | Browser via HTTPS        |
| **Administrador**      | Gerencia configurações, usuários e permissões | Browser via HTTPS        |
| **Sistema Integrador** | Aplicações externas que consomem a API        | REST API via HTTPS + JWT |

### Sistema Principal

| Sistema               | Descrição                                                                           | Tecnologia            |
| --------------------- | ----------------------------------------------------------------------------------- | --------------------- |
| **Template Platform** | Plataforma web corporativa com autenticação, RBAC, módulos extensíveis e API Routes | Next.js 14 + Supabase |

### Sistemas Externos

| Sistema      | Propósito                         | Protocolo        | Obrigatório |
| ------------ | --------------------------------- | ---------------- | ----------- |
| **Supabase** | Auth, Database, Realtime, Storage | HTTPS            | Sim         |
| **Redis**    | Cache, sessões, rate limiting     | TCP (porta 6379) | Opcional    |
| **SMTP**     | Notificações por e-mail           | SMTP (porta 587) | Opcional    |

## Fluxos Principais

### 1. Autenticação de Usuário

```mermaid
sequenceDiagram
    participant U as Usuário
    participant App as Next.js App
    participant S as Supabase Auth

    U->>App: Acessa aplicação
    App->>S: signInWithPassword / signInWithOAuth
    S->>U: Tela de login (ou OAuth redirect)
    U->>S: Credenciais
    S->>App: Session (access_token + refresh_token)
    App->>App: Middleware valida session
    App->>S: Query dados com RLS
    S->>App: Response
```

### 2. Integração Externa (API)

```mermaid
sequenceDiagram
    participant I as Sistema Integrador
    participant App as Next.js API Routes
    participant S as Supabase

    I->>App: GET /api/resource (Authorization: Bearer token)
    App->>S: Valida JWT via supabase.auth.getUser()
    S->>App: User + roles
    App->>S: Query dados com RLS
    S->>App: Resultado
    App->>I: JSON response
```

## Limites do Sistema

### Dentro do Escopo (Template Platform)

- Next.js App (SSR + API Routes)
- Autenticação via Supabase Auth
- Autorização RBAC via RLS
- Módulos de negócio
- Design System (Tailwind)
- Testes E2E

### Fora do Escopo (Sistemas Externos)

- Supabase (Auth, Database, Realtime, Storage) - plataforma gerenciada
- Redis - cache distribuído (opcional)
- Infraestrutura de rede/DNS
- CDN para assets estáticos

---

**Próximo nível:** [C4 Container Diagram](./c4-container.md)
