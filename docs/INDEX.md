# Portal de Documentação - Template Platform

> **Versão:** 1.0.0 | **Última atualização:** Março 2026

Índice mestre da documentação. Esta é a **source of truth** para o projeto.

---

## Quick Start

| Objetivo                  | Documento                                                      |
| ------------------------- | -------------------------------------------------------------- |
| **Configurar ambiente**   | [operacao/setup-local.md](./operacao/setup-local.md)           |
| **Entender arquitetura**  | [arquitetura/c4-container.md](./arquitetura/c4-container.md)   |
| **Integrar autenticação** | [contratos-integracao/auth.md](./contratos-integracao/auth.md) |
| **Consumir API**          | [contratos-integracao/api.md](./contratos-integracao/api.md)   |
| **Resolver problemas**    | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)                     |

---

## Estrutura Canônica

### 📐 Arquitetura (`arquitetura/`)

Diagramas C4 Model da arquitetura do sistema.

| Documento                                        | Nível | Descrição                             |
| ------------------------------------------------ | ----- | ------------------------------------- |
| [c4-context.md](./arquitetura/c4-context.md)     | L1    | Contexto - atores e sistemas externos |
| [c4-container.md](./arquitetura/c4-container.md) | L2    | Containers - serviços deployáveis     |
| [c4-component.md](./arquitetura/c4-component.md) | L3    | Componentes internos                  |

### 🔗 Contratos de Integração (`contratos-integracao/`)

Documentação para sistemas que integram com o Template Platform.

| Documento                                       | Descrição                             |
| ----------------------------------------------- | ------------------------------------- |
| [auth.md](./contratos-integracao/auth.md)       | OIDC, JWT, JWKS, roles, exemplos      |
| [api.md](./contratos-integracao/api.md)         | REST, rate limiting, erros, paginação |
| [openapi.md](./contratos-integracao/openapi.md) | Swagger, geração de clientes          |

### 🔧 Operação (`operacao/`)

Guias de setup, deploy e operação.

| Documento                                                                                           | Descrição                                   |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| [setup-local.md](./operacao/setup-local.md)                                                         | Configuração do ambiente de desenvolvimento |
| [deploy.md](./operacao/deploy.md)                                                                   | Deploy em Docker, staging, produção         |
| [variaveis-ambiente.md](./operacao/variaveis-ambiente.md)                                           | Referência de env vars                      |
| [convencoes.md](./operacao/convencoes.md)                                                           | Convenções de código e scripts              |
| [workflows/criar_repo_a_partir_do_modelo.md](./operacao/workflows/criar_repo_a_partir_do_modelo.md) | Criar nova repo a partir do template        |

### 🔐 Segurança (`seguranca/`)

Documentação de segurança e controle de acesso.

| Documento                                                | Descrição                                          |
| -------------------------------------------------------- | -------------------------------------------------- |
| [rbac.md](./seguranca/rbac.md)                           | Sistema de roles (ADMIN, GESTOR, OPERADOR, VIEWER) |
| [headers-seguranca.md](./seguranca/headers-seguranca.md) | CSP, CORS, CSRF, headers HTTP                      |

### 📋 ADRs (`adr_v2/`)

Architecture Decision Records - decisões arquiteturais documentadas.

| ADR                                          | Título                         | Status |
| -------------------------------------------- | ------------------------------ | ------ |
| [001](./adr_v2/001-stack-tecnologica.md)     | Stack Tecnológica              | Aceito |
| [002](./adr_v2/002-arquitetura-modular.md)   | Arquitetura Modular (Monorepo) | Aceito |
| [003](./adr_v2/003-autenticacao-jwt-rbac.md) | Autenticação JWT + RBAC        | Aceito |

Ver [adr_v2/README.md](./adr_v2/README.md) para template e como contribuir.

### 📚 Referência

| Documento                                  | Descrição                          |
| ------------------------------------------ | ---------------------------------- |
| [99-mapa-do-repo.md](./99-mapa-do-repo.md) | Mapa completo do repositório       |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)     | Design System, tokens, componentes |
| [BOOK_OF_TESTS.md](./BOOK_OF_TESTS.md)     | Matriz de testes e cobertura       |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Problemas comuns e soluções        |

### 📊 Governança e Release

| Documento                                                      | Descrição                                         |
| -------------------------------------------------------------- | ------------------------------------------------- |
| [TECHNICAL-DEBT.md](./TECHNICAL-DEBT.md)                       | Technical Debt Register (11 ativos, 2 resolvidos) |
| [SPRINT-LOG.md](./SPRINT-LOG.md)                               | Log histórico de execução — Sprints 19–24         |
| [RETROSPECTIVA-RELEASE-1.0.md](./RETROSPECTIVA-RELEASE-1.0.md) | Retrospectiva e lições aprendidas Release 1.0     |
| [MEGAPLAN-EVOLUCAO.md](./MEGAPLAN-EVOLUCAO.md)                 | Plano mestre v1.3 — 24 sprints revisados          |
| [BACKLOG-V1.1.md](./BACKLOG-V1.1.md)                           | Backlog consolidado v1.1 (Sprints 25–29)          |

---

## Estrutura de Pastas

```text
docs/
├── INDEX.md                    # Este arquivo (índice mestre)
├── 99-mapa-do-repo.md          # Mapa do repositório
├── DESIGN_SYSTEM.md            # Design System
├── BOOK_OF_TESTS.md            # Matriz de testes
├── TROUBLESHOOTING.md          # Troubleshooting
│
├── arquitetura/                # C4 Model diagrams
│   ├── c4-context.md
│   ├── c4-container.md
│   └── c4-component.md
│
├── contratos-integracao/       # Para integradores
│   ├── auth.md
│   ├── api.md
│   └── openapi.md
│
├── operacao/                   # DevOps
│   ├── setup-local.md
│   ├── deploy.md
│   ├── variaveis-ambiente.md
│   └── convencoes.md
│
├── seguranca/                  # Security
│   ├── rbac.md
│   └── headers-seguranca.md
│
├── adr_v2/                     # ADRs (padrão oficial)
│   ├── README.md
│   ├── template_v2.md
│   ├── 001-stack-tecnologica.md
│   ├── 002-arquitetura-modular.md
│   └── 003-autenticacao-jwt-rbac.md
│
├── _archive/                   # Docs arquivados (histórico)
├── _backlog/                   # Ideias e backlog
├── 00-auditoria/               # Relatórios de auditoria
│
└── (Release 1.0)
    ├── TECHNICAL-DEBT.md       # Technical Debt Register
    ├── SPRINT-LOG.md           # Sprint logs Sprints 19-24
    ├── RETROSPECTIVA-RELEASE-1.0.md  # Retrospectiva Release 1.0
    ├── MEGAPLAN-EVOLUCAO.md    # Plano mestre v1.3 (24 sprints)
    └── BACKLOG-V1.1.md         # Backlog consolidado v1.1
```

---

## Links Úteis

| Serviço            | URL Local                    |
| ------------------ | ---------------------------- |
| Frontend           | <http://localhost:13000>     |
| API                | <http://localhost:8000>      |
| API Docs (Swagger) | <http://localhost:8000/docs> |
| Keycloak           | <http://localhost:8080>      |
| Storybook          | <http://localhost:6006>      |

**GitHub:** [ClaudioRibeiro2023/Modelo](https://github.com/ClaudioRibeiro2023/Modelo)

---

## Manutenção

### Criar novo ADR

1. Copie `adr_v2/template_v2.md`
2. Preencha todas as seções (especialmente "Impacto em Integrações")
3. Atualize `adr_v2/README.md` e este INDEX

### Atualizar docs

- Mantenha **pt-BR** em toda documentação
- Atualize este INDEX ao criar/mover documentos
- Use seção 6 "Impacto em Integrações" nos ADRs

---

_Documentação consolidada em 2024-12-16 | Atualizada para Release 1.0 em 2026-03-25_
