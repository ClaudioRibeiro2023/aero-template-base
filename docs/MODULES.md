# Sistema Modular — Guia Completo

> **Versao:** 4.0 | **Pacote:** `@template/modules` | **Data:** Abril 2026

O Template.Base usa um sistema modular que permite habilitar, desabilitar e compor funcionalidades de forma declarativa. Cada modulo e autocontido: declara suas rotas, dependencias, tabelas, hooks e componentes em um unico manifest.

---

## Indice

1. [Visao Geral da Arquitetura](#1-visao-geral-da-arquitetura)
2. [Categorias de Modulos](#2-categorias-de-modulos)
3. [Modulos Disponiveis](#3-modulos-disponiveis)
4. [Como Criar um Novo Modulo](#4-como-criar-um-novo-modulo)
5. [Como Habilitar/Desabilitar Modulos](#5-como-habilitardesabilitar-modulos)
6. [Sistema de Dependencias](#6-sistema-de-dependencias)
7. [Route Gating (Middleware + API Guard)](#7-route-gating-middleware--api-guard)
8. [Componente ModuleGate (Client-side)](#8-componente-modulegate-client-side)
9. [Integracao com Feature Flags](#9-integracao-com-feature-flags)
10. [Referencia do Manifest](#10-referencia-do-manifest)

---

## 1. Visao Geral da Arquitetura

O sistema modular segue um pipeline de resolucao em 5 etapas:

```
Manifests (*.manifest.ts)
    |
    v
modules.config.ts (overrides do operador)
    |
    v
resolveModules() (valida dependencias, detecta ciclos, topological sort)
    |
    v
middleware.ts (gating de rotas — bloqueia acesso a modulos desabilitados)
    |
    v
ModuleProvider / ModuleGate (contexto React — esconde UI de modulos inativos)
```

### Arquivos-chave

| Arquivo                                     | Responsabilidade                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `packages/modules/src/manifest.ts`          | Tipos `ModuleManifest`, `ModuleCategory`, helper `defineManifest()`        |
| `packages/modules/src/resolver.ts`          | `resolveModules()` — aplica overrides, valida dependencias, detecta ciclos |
| `apps/web/config/modules/*.manifest.ts`     | Manifests individuais de cada modulo                                       |
| `apps/web/config/modules/index.ts`          | Inicializacao — importa manifests, resolve e registra no registry          |
| `apps/web/modules.config.ts`                | Configuracao do operador — habilita/desabilita modulos                     |
| `apps/web/lib/module-gate.ts`               | Funcoes de gating server-side (`isRouteEnabled`, `isApiRouteEnabled`)      |
| `apps/web/lib/api-module-guard.ts`          | Wrapper `withModuleGuard()` para API routes                                |
| `apps/web/lib/module-context.tsx`           | `ModuleProvider` e `useModuleEnabled()` — contexto React                   |
| `apps/web/components/common/ModuleGate.tsx` | Componente `<ModuleGate>` para renderizacao condicional                    |

### Fluxo de dados

1. **Build-time:** Cada modulo declara um manifest (`defineManifest()`). O arquivo `config/modules/index.ts` importa todos e chama `resolveModules()` com os overrides de `modules.config.ts`.
2. **Server-side:** O `middleware.ts` usa `isRouteEnabled()` e `isApiRouteEnabled()` para bloquear rotas de modulos desabilitados (retorna 404).
3. **Client-side:** O `ModuleProvider` recebe a lista de IDs habilitados. Componentes usam `useModuleEnabled()` ou `<ModuleGate>` para renderizar condicionalmente.

---

## 2. Categorias de Modulos

| Categoria  | Comportamento                                 | Pode Desabilitar? | Exemplos                      |
| ---------- | --------------------------------------------- | ----------------- | ----------------------------- |
| `core`     | Sempre ativo. Override ignorado com warning.  | Nao               | auth, admin, settings, search |
| `default`  | Ativo por padrao. Operador pode desabilitar.  | Sim               | dashboard, reports            |
| `optional` | Inativo por padrao. Operador deve habilitar.  | Sim               | tasks, support, organizations |
| `utility`  | Servico interno consumido por outros modulos. | Sim               | file-upload                   |

A categoria e definida no manifest de cada modulo (`category: 'core' | 'default' | 'optional' | 'utility'`).

---

## 3. Modulos Disponiveis

### Core (sempre ativos)

| Modulo        | ID         | Descricao                                    |
| ------------- | ---------- | -------------------------------------------- |
| Autenticacao  | `auth`     | Login, registro, OAuth, recuperacao de senha |
| Admin         | `admin`    | Painel administrativo, gestao de usuarios    |
| Configuracoes | `settings` | Preferencias do usuario e do sistema         |
| Busca         | `search`   | Busca global (Command Palette)               |

### Default (ativos por padrao)

| Modulo     | ID          | Dependencias | Descricao                           |
| ---------- | ----------- | ------------ | ----------------------------------- |
| Dashboard  | `dashboard` | auth         | KPIs, metricas, atividade recente   |
| Relatorios | `reports`   | auth         | Relatorios com filtros e exportacao |

### Optional (inativos por padrao)

| Modulo        | ID              | Dependencias | Descricao                            |
| ------------- | --------------- | ------------ | ------------------------------------ |
| Tarefas       | `tasks`         | auth         | CRUD de tarefas com filtros e status |
| Suporte       | `support`       | auth         | Tickets de suporte                   |
| Notificacoes  | `notifications` | auth         | Central de notificacoes              |
| Feature Flags | `feature-flags` | auth         | Flags de funcionalidade via Supabase |
| Organizacoes  | `organizations` | auth         | Multi-tenant (organizacoes)          |

### Utility

| Modulo | ID            | Dependencias | Descricao                      |
| ------ | ------------- | ------------ | ------------------------------ |
| Upload | `file-upload` | auth         | Upload de arquivos com storage |

---

## 4. Como Criar um Novo Modulo

### Opcao A — Scaffold automatico (recomendado)

```bash
pnpm create-module
# ou com flags:
node scripts/scaffold-module.mjs meu-modulo --functions listagem,detalhes
```

O scaffold cria automaticamente a estrutura de pastas, manifest, paginas e componentes.

### Opcao B — Criacao manual

Siga estes 5 passos:

#### Passo 1: Criar o manifest

Crie `apps/web/config/modules/meu-modulo.manifest.ts`:

```ts
import { defineManifest } from '@template/modules'

export default defineManifest({
  // ── Identificacao ──────────────────────────────────────
  id: 'meu-modulo',
  name: 'Meu Modulo',
  description: 'Descricao curta do que o modulo faz',
  version: '1.0.0',
  category: 'optional', // core | default | optional | utility
  enabled: true, // valor padrao (antes dos overrides)
  order: 10, // posicao na sidebar

  // ── Dependencias ───────────────────────────────────────
  dependencies: ['auth'], // IDs de modulos necessarios

  // ── Rotas ──────────────────────────────────────────────
  routes: ['/meu-modulo'], // rotas de pagina controladas
  apiRoutes: ['/api/meu-modulo'], // prefixos de API controlados

  // ── Infraestrutura ─────────────────────────────────────
  requiredTables: ['meu_modulo_items'], // tabelas Supabase necessarias
  envVars: [], // variaveis de ambiente extras
  featureFlags: ['module.meu-modulo'], // feature flags associadas

  // ── Developer Experience ───────────────────────────────
  hooks: ['useMeuModulo'], // hooks React expostos
  components: ['MeuModuloClient'], // componentes principais

  // ── Navegacao ──────────────────────────────────────────
  icon: 'Box', // icone Lucide para sidebar
  path: '/meu-modulo', // rota base
  roles: [], // roles com acesso (vazio = todos)
  showInSidebar: true, // mostrar na sidebar
  group: 'Principal', // grupo na sidebar

  // ── Funcoes/Paginas ────────────────────────────────────
  functions: [
    {
      id: 'meu-modulo-list',
      moduleId: 'meu-modulo',
      name: 'Listagem',
      subtitle: 'Ver todos os itens',
      path: '/meu-modulo',
      category: 'OPERACIONAL',
      enabled: true,
      order: 0,
      roles: [],
      tags: ['listagem'],
    },
  ],
})
```

#### Passo 2: Registrar o manifest

Edite `apps/web/config/modules/index.ts` — adicione o import e inclua no array `ALL_MANIFESTS`:

```ts
import meuModuloManifest from './meu-modulo.manifest'

const ALL_MANIFESTS: ModuleManifest[] = [
  // ... manifests existentes ...
  meuModuloManifest,
]
```

#### Passo 3: Adicionar ao modules.config.ts

Edite `apps/web/modules.config.ts`:

```ts
export const moduleOverrides: Record<string, ModuleOverride> = {
  // ... overrides existentes ...
  'meu-modulo': { enabled: true },
}
```

#### Passo 4: Criar as paginas

Crie a estrutura em `apps/web/app/(protected)/meu-modulo/`:

```
apps/web/app/(protected)/meu-modulo/
├── page.tsx              # Server Component (rota /meu-modulo)
├── loading.tsx           # Skeleton de carregamento
├── error.tsx             # Error boundary
└── components/
    └── MeuModuloClient.tsx  # Client Component com logica interativa
```

Exemplo de `page.tsx`:

```tsx
import { requireAuth } from '@/lib/auth-guard'
import { MeuModuloClient } from './components/MeuModuloClient'

export default async function MeuModuloPage() {
  const user = await requireAuth()
  return <MeuModuloClient userId={user.id} />
}
```

#### Passo 5: Criar as API routes (se necessario)

```
apps/web/app/api/meu-modulo/
└── route.ts
```

Exemplo com guard de modulo:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withModuleGuard } from '@/lib/api-module-guard'
import { withApiLog } from '@/lib/api-logger'

export const GET = withModuleGuard(
  'meu-modulo',
  withApiLog('meu-modulo', async function GET(req: NextRequest) {
    // ... logica do handler
    return NextResponse.json({ items: [] })
  })
)
```

---

## 5. Como Habilitar/Desabilitar Modulos

### Via modules.config.ts (build-time)

O arquivo `apps/web/modules.config.ts` e o **unico lugar** onde o operador define quais modulos estao ativos:

```ts
export const moduleOverrides: Record<string, ModuleOverride> = {
  tasks: { enabled: true }, // habilita
  support: { enabled: false }, // desabilita
}
```

**Regras:**

- Modulos `core` **nao podem** ser desabilitados — o override e ignorado com warning no console.
- Se um modulo nao aparece nos overrides, usa o valor `enabled` do proprio manifest.
- Alterar `modules.config.ts` requer rebuild (`pnpm build` ou restart do `pnpm dev`).

### Via Feature Flags (runtime)

Modulos habilitados em build-time podem ser desabilitados em runtime via feature flags. A flag `module.<id>` (ex: `module.tasks`) quando `false` esconde o modulo sem rebuild.

Isso permite rollout gradual: habilite em build-time e controle a visibilidade por feature flag.

> Veja a secao [9. Integracao com Feature Flags](#9-integracao-com-feature-flags) para detalhes.

---

## 6. Sistema de Dependencias

Cada manifest declara suas dependencias no campo `dependencies`:

```ts
dependencies: ['auth'] // este modulo precisa do modulo 'auth' habilitado
```

### Validacao automatica

O `resolveModules()` valida automaticamente no startup:

1. **Dependencia inexistente** — Erro se o modulo depende de um ID que nao existe
2. **Dependencia desabilitada** — Erro se o modulo depende de um que esta `enabled: false`
3. **Ciclos** — Detecta dependencias circulares via DFS e reporta o ciclo completo

Erros de dependencia sao logados no console com detalhes:

```
[modules] Erros de resolucao de modulos:
  - Modulo 'tasks' depende de 'auth' que esta desabilitado
  - Dependencia circular detectada: a -> b -> c -> a
```

### Ordenacao topologica

Modulos sao ordenados automaticamente por dependencia (topological sort). Dependencias sao resolvidas antes dos dependentes, garantindo que a inicializacao respeite a ordem.

---

## 7. Route Gating (Middleware + API Guard)

### Middleware (server-side, automatico)

O `middleware.ts` intercepta todas as requisicoes e verifica se a rota pertence a um modulo habilitado:

- **Rota de pagina** desabilitada → redirect para 404
- **Rota de API** desabilitada → resposta JSON 404
- **Rota sem modulo** (publica, core) → permitida normalmente

Isso acontece automaticamente — nao precisa configurar nada alem do manifest.

### API Module Guard (defesa em profundidade)

Alem do middleware, API routes de modulos opcionais devem usar o wrapper `withModuleGuard()`:

```ts
import { withModuleGuard } from '@/lib/api-module-guard'

export const GET = withModuleGuard('meu-modulo', async function GET(req) {
  // So executa se o modulo estiver habilitado
  return NextResponse.json({ data: [] })
})
```

Se o modulo estiver desabilitado, retorna:

```json
{
  "error": "Module not available",
  "module": "meu-modulo",
  "message": "O modulo 'meu-modulo' nao esta habilitado nesta instalacao"
}
```

### Funcoes de gating disponiveis

| Funcao                           | Arquivo                   | Descricao                                     |
| -------------------------------- | ------------------------- | --------------------------------------------- |
| `isModuleEnabled(id)`            | `lib/module-gate.ts`      | Verifica se modulo esta habilitado            |
| `isRouteEnabled(pathname)`       | `lib/module-gate.ts`      | Verifica se rota de pagina esta habilitada    |
| `isApiRouteEnabled(pathname)`    | `lib/module-gate.ts`      | Verifica se rota de API esta habilitada       |
| `getModuleForRoute(pathname)`    | `lib/module-gate.ts`      | Retorna ID do modulo que controla a rota      |
| `getModuleForApiRoute(pathname)` | `lib/module-gate.ts`      | Retorna ID do modulo que controla a API route |
| `withModuleGuard(id, handler)`   | `lib/api-module-guard.ts` | Wrapper para API routes                       |

---

## 8. Componente ModuleGate (Client-side)

O componente `<ModuleGate>` renderiza seu conteudo apenas se o modulo estiver habilitado:

```tsx
import { ModuleGate } from '@/components/common/ModuleGate'

// Basico — esconde se desabilitado
<ModuleGate moduleId="notifications">
  <NotificationCenter />
</ModuleGate>

// Com fallback — mostra alternativa se desabilitado
<ModuleGate moduleId="tasks" fallback={<p>Modulo de tarefas nao disponivel</p>}>
  <TaskList />
</ModuleGate>
```

### Props

| Prop       | Tipo        | Obrigatorio | Descricao                                 |
| ---------- | ----------- | ----------- | ----------------------------------------- |
| `moduleId` | `string`    | Sim         | ID do modulo                              |
| `children` | `ReactNode` | Sim         | Conteudo renderizado quando ativo         |
| `fallback` | `ReactNode` | Nao         | Conteudo quando inativo (default: `null`) |

### Hook useModuleEnabled

Para logica mais complexa, use o hook diretamente:

```tsx
import { useModuleEnabled } from '@/lib/module-context'

function MinhaFeature() {
  const tasksEnabled = useModuleEnabled('tasks')
  const notificationsEnabled = useModuleEnabled('notifications')

  return (
    <div>
      {tasksEnabled && <TaskWidget />}
      {notificationsEnabled && <NotificationBadge />}
    </div>
  )
}
```

### ModuleProvider

O `ModuleProvider` e configurado no `app/providers.tsx` e recebe a lista de IDs habilitados:

```tsx
<ModuleProvider enabledModules={['auth', 'dashboard', 'tasks', 'notifications']}>
  {children}
</ModuleProvider>
```

---

## 9. Integracao com Feature Flags

O sistema modular integra com feature flags em duas camadas:

### Camada 1: Build-time (modules.config.ts)

Define quais modulos existem na instalacao. Requer rebuild para alterar.

### Camada 2: Runtime (feature flags)

Modulos habilitados em build-time podem ser controlados em runtime:

- A flag `module.<id>` (ex: `module.tasks`) no sistema de feature flags
- Se a flag existe e seu valor e `false`, o modulo e desabilitado em runtime
- Se a flag nao existe ou e `true`, o modulo segue o build-time config

**Fluxo de decisao:**

```
modules.config.ts diz enabled?
  ├── NAO → modulo desabilitado (fim)
  └── SIM → feature flag 'module.<id>' existe?
        ├── NAO → modulo habilitado (fim)
        └── SIM → flag e true?
              ├── SIM → modulo habilitado (fim)
              └── NAO → modulo desabilitado (fim)
```

**Casos de uso:**

- **Rollout gradual:** Habilite o modulo em build-time, controle acesso via flag por grupo de usuarios
- **Kill switch:** Desabilite um modulo em runtime sem rebuild/deploy
- **Testes A/B:** Ative um modulo para porcentagem dos usuarios

### Declarar feature flags no manifest

```ts
featureFlags: ['module.meu-modulo']
```

Isso documenta a flag associada. A verificacao e feita pelo `useModuleEnabled()` automaticamente.

---

## 10. Referencia do Manifest

### Interface completa: `ModuleManifest`

```ts
interface ModuleManifest {
  // ── Identificacao ──────────────────────────────────────
  id: string // Identificador unico (kebab-case)
  name: string // Nome de exibicao
  description: string // Descricao curta
  version: string // Versao semantica (semver)
  category: ModuleCategory // 'core' | 'default' | 'optional' | 'utility'
  enabled: boolean // Valor padrao (antes dos overrides)
  order: number // Posicao na sidebar/ordenacao

  // ── Dependencias ───────────────────────────────────────
  dependencies: string[] // IDs de modulos necessarios

  // ── Rotas ──────────────────────────────────────────────
  routes: string[] // Rotas de pagina controladas
  apiRoutes: string[] // Prefixos de API routes controlados

  // ── Infraestrutura ─────────────────────────────────────
  requiredTables: string[] // Tabelas Supabase necessarias
  envVars: ModuleEnvVar[] // Variaveis de ambiente extras
  featureFlags: string[] // Feature flags associadas

  // ── Developer Experience ───────────────────────────────
  hooks: string[] // Hooks React que o modulo prove
  components: string[] // Componentes principais do modulo

  // ── Navegacao ──────────────────────────────────────────
  icon: string // Icone Lucide para sidebar
  path: string // Rota base do modulo
  roles: string[] // Roles com acesso (vazio = todos)
  showInSidebar: boolean // Mostrar na sidebar
  group: string // Grupo na sidebar

  // ── Funcoes ────────────────────────────────────────────
  functions: ModuleFunctionDef[] // Sub-paginas/funcoes do modulo
}
```

### Interface: `ModuleEnvVar`

```ts
interface ModuleEnvVar {
  key: string // Nome da variavel (ex: NEXT_PUBLIC_SUPABASE_URL)
  required: boolean // Se e obrigatoria
  description: string // Descricao da variavel
}
```

### Interface: `ModuleFunctionDef`

```ts
interface ModuleFunctionDef {
  id: string // Identificador unico da funcao
  moduleId: string // ID do modulo pai
  name: string // Nome de exibicao
  subtitle?: string // Subtitulo opcional
  path: string // Rota da funcao
  icon?: string // Icone Lucide (opcional)
  category: string // Categoria funcional (OPERACIONAL, ANALISE, etc.)
  enabled: boolean // Se esta ativa
  order: number // Posicao na lista
  roles: string[] // Roles com acesso (vazio = todos)
  tags: string[] // Tags para busca/filtro
}
```

### Interface: `ModuleOverride`

```ts
interface ModuleOverride {
  enabled: boolean // true para habilitar, false para desabilitar
}
```

### Interface: `ResolvedModuleSet`

Resultado retornado por `resolveModules()`:

```ts
interface ResolvedModuleSet {
  enabled: ModuleManifest[] // Modulos habilitados, ordenados
  disabled: ModuleManifest[] // Modulos desabilitados
  all: ModuleManifest[] // Todos (enabled + disabled)
  enabledIds: Set<string> // Set de IDs habilitados (lookup rapido)
  enabledRoutes: Set<string> // Rotas habilitadas
  enabledApiRoutes: Set<string> // Prefixos de API habilitados
  errors: string[] // Erros de validacao (dependencias, ciclos)
  warnings: string[] // Warnings nao-bloqueantes
}
```

---

## Resumo do Fluxo Completo

```
1. Desenvolvedor cria manifest (*.manifest.ts)
2. Registra no index.ts (ALL_MANIFESTS)
3. Operador configura modules.config.ts
4. No startup, resolveModules() valida tudo
5. Middleware bloqueia rotas de modulos inativos (server-side)
6. ModuleGate/useModuleEnabled esconde UI (client-side)
7. withModuleGuard protege API routes (defesa em profundidade)
8. Feature flags permitem controle runtime sem rebuild
```

---

_Criado em Abril 2026 como parte do Sprint 7: Bootstrap Guide + Module Documentation_
