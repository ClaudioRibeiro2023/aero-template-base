---
sidebar_position: 2
title: Início Rápido
---

# Início Rápido

## Pré-requisitos

- **Node.js** >= 18.x
- **pnpm** >= 9.x (`npm install -g pnpm`)
- **Docker** e **Docker Compose** (para serviços auxiliares, opcional)

## 1. Clone e Instale

```bash
git clone https://github.com/seu-org/template-platform.git
cd template-platform
pnpm install
```

## 2. Configure o Ambiente

```bash
cp .env.example .env
```

Variáveis principais:

| Variável                        | Descrição               | Default                           |
| ------------------------------- | ----------------------- | --------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL do projeto Supabase | `https://seu-projeto.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase  | (ver painel Supabase)             |

## 3. Inicie o Desenvolvimento

```bash
pnpm dev
```

- Frontend: http://localhost:13000

## 4. Scripts Úteis

| Comando                     | Descrição                          |
| --------------------------- | ---------------------------------- |
| `pnpm dev`                  | Inicia o frontend                  |
| `pnpm build`                | Build de produção (packages + app) |
| `pnpm test:run`             | Roda todos os testes FE            |
| `pnpm test:all`             | Todos os testes                    |
| `pnpm storybook`            | Abre o Storybook na porta 6006     |
| `pnpm e2e`                  | Testes E2E (Playwright)            |
| `pnpm create-module <name>` | Scaffold de novo módulo frontend   |

## Próximos Passos

- [Estrutura do Projeto](./project-structure)
- [Arquitetura](./architecture)
- [Criando um Novo Módulo](./guides/new-module)
