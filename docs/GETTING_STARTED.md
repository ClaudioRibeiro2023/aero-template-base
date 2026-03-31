# Guia de Início Rápido

Guia passo a passo para configurar e rodar um projeto baseado no Template.Base v2.1.

## Pré-requisitos

| Ferramenta     | Versão Mínima | Instalação                           |
| -------------- | ------------- | ------------------------------------ |
| Node.js        | 20+           | [nodejs.org](https://nodejs.org)     |
| pnpm           | 9+            | `npm install -g pnpm`                |
| Supabase CLI   | 1.x           | `npm install -g supabase`            |
| Conta Supabase | —             | [supabase.com](https://supabase.com) |

## Setup em 4 Passos

### 1. Clone o template

```bash
git clone <repo-url> meu-projeto
cd meu-projeto
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Execute o setup wizard

```bash
pnpm run setup
```

O wizard interativo vai configurar:

- **Nome do projeto** e namespace dos pacotes
- **Supabase** — URL e chaves do projeto (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- **Branding** — Nome da aplicação, cores primárias, logo

O wizard gera automaticamente o arquivo `.env.local` com todas as variáveis.

### 4. Configure o `.env` e inicie

```bash
# Revise o .env.local gerado pelo wizard
# Depois inicie o servidor de desenvolvimento:
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Modo Demo (sem Supabase)

Para desenvolvimento local sem precisar de um projeto Supabase, ative o modo demo:

```env
NEXT_PUBLIC_DEMO_MODE=true
```

O modo demo usa dados mockados e autenticação simulada, ideal para:

- Explorar a interface e componentes
- Desenvolver módulos de frontend isoladamente
- Demonstrações e prototipagem rápida

> **Atenção:** O modo demo desabilita persistência real. Para testar fluxos completos, configure um projeto Supabase.

## Setup Não-Interativo (CI/CD)

Para automação, passe um arquivo de configuração:

```bash
pnpm run setup --config setup.json
```

Veja `scripts/setup.example.json` para o formato esperado.

## Comandos Principais

| Comando              | Descrição                                            |
| -------------------- | ---------------------------------------------------- |
| `pnpm dev`           | Inicia o servidor de desenvolvimento (Next.js)       |
| `pnpm build`         | Build de produção (pacotes + aplicação)              |
| `pnpm lint`          | Executa ESLint no código-fonte                       |
| `pnpm typecheck`     | Verificação de tipos TypeScript em todos os pacotes  |
| `pnpm test`          | Executa testes com Vitest (watch mode)               |
| `pnpm test:run`      | Executa testes uma única vez (CI)                    |
| `pnpm storybook`     | Inicia o Storybook do design system                  |
| `pnpm db:migrate`    | Aplica migrations no Supabase                        |
| `pnpm db:types`      | Gera tipos TypeScript a partir do schema do Supabase |
| `pnpm create-module` | Cria um novo módulo de funcionalidade                |
| `pnpm clean`         | Remove node_modules e builds de todos os pacotes     |

## Estrutura do Projeto

```
├── apps/web/               # Frontend Next.js 14 (App Router)
├── packages/
│   ├── design-system/      # Componentes UI canônicos + Storybook
│   ├── shared/             # Auth adapter, Supabase client, utilitários
│   └── types/              # TypeScript types compartilhados (UserRole, etc.)
├── supabase/
│   └── migrations/         # 8 migrations SQL com RLS e triggers
├── infra/                  # Docker Compose para infra local
└── scripts/                # Setup wizard e utilitários
```

## Próximos Passos

- [Arquitetura](./ARCHITECTURE.md) — Entenda a stack e padrões do template
- [Deploy](./DEPLOY.md) — Configure deploy em produção
- [Customização](./CUSTOMIZATION.md) — Adapte branding, temas e módulos
