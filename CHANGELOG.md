# Changelog

Todas as mudanças notáveis neste projeto são documentadas aqui.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
aderindo a [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [2.1.0] — 2026-03-30

### Sprint 1 — Exorcismo da Stack Anterior

- Removidos todos os artefatos FastAPI, Keycloak, Vite (40+ arquivos)
- CI/CD limpo de referências a Python/uvicorn/VITE\_\*
- K8s e Docker removidos os serviços obsoletos

### Sprint 2 — Blindagem de Segurança

- Migrations 00005-00008: RLS audit_logs, handle_new_user, FK RESTRICT, drop uuid-ossp
- Middleware reescrito com @supabase/ssr (auto-refresh de tokens, sem parsing manual)
- Rate limiting em admin/config (30 req/min) e health (60 req/min)
- CSP header adicionado, infra/.env protegido no .gitignore
- Rota /api/auth/callback duplicada removida

### Sprint 3 — Unificação de Design System

- Cor brand unificada: #14b8a6 → #0087A8 (Design System é fonte de verdade)
- Toast deduplicado: 4 arquivos removidos, 6 consumidores migrados para @template/design-system
- FormInput/FormSelect/FormTextarea removidos (3 duplicatas), DS canônico preservado
- SkipLink de acessibilidade adicionado em layout.tsx
- GlobalSearch com role="dialog" e aria-modal

### Sprint 4 — Backend Hardening

- lib/api-response.ts: 9 helpers padronizados (ok, created, badRequest, unauthorized, etc.)
- lib/auth-guard.ts: requireAuth() e requireRole() com profile lookup
- lib/validate.ts: parseBody<T> com Zod e discriminated union
- schemas/auth.ts + schemas/admin.ts: 7 schemas Zod
- Novas rotas: POST /api/auth/signup, /api/auth/reset-password, /api/auth/logout
- UserRole unificado: 5 definições → 1 fonte canônica em @template/types

### Sprint 5 — Modernização de Stack

- TypeScript 5.3.3 → ^5.5.0, target ES2022, verbatimModuleSyntax
- next.config.js → next.config.mjs (ESM)
- ESLint 8 → 9, .eslintrc.cjs → eslint.config.mjs (flat config)
- vercel.json: rootDirectory apps/web, regions gru1 (São Paulo)

### Sprint 6 — Observabilidade

- instrumentation.ts: placeholder Sentry server-side documentado
- health/route.ts: ping real Supabase + uptime
- deploy-vercel.yml: deploy automático em push master
- .env.example: NEXT_PUBLIC_SENTRY_DSN documentado

### Sprint 7 — Cobertura de Testes

- 192 testes (10 arquivos novos): componentes, hooks, lib, schemas
- vitest.config.ts: threshold 60% (lines, branches, functions, statements)
- vitest.setup.ts corrigido, middleware.test.ts atualizado para @supabase/ssr

---

## [2.0.2] — 2026-03-30

### Resumo

**Login Premium + Deploy Vercel + Documentacao.** Redesign completo da pagina de login com efeitos visuais cinematograficos extraidos do aero-survey. Deploy em producao na Vercel com dominio custom template.aeroeng.tech. Documentacao reescrita para refletir a stack atual.

### Adicionado

- Login page com 12 camadas de efeitos visuais: 30 particulas flutuantes, 5 drones SVG com rotores animados, 3 orbit rings, radar sweep, scan line, grid animado, noise texture, vignette, vector lines, corner brackets, drone telemetry overlay, logo glitch animation
- Deploy Vercel configurado com custom domain template.aeroeng.tech
- ARCHITECTURE.md na raiz com visao tecnica (decisoes, diagramas, fluxo de auth, seguranca, CI/CD)
- Branch control no vercel.json (apenas master faz deploy)

### Alterado

- README.md reescrito completamente em PT-BR — reflete stack atual (Next.js 14 + Supabase), remove referencias a FastAPI, Vite, Keycloak e Playwright que nao existem mais na v2.0
- Status ticker atualizado com "DRONE FLEET ACTIVE: 5 UNITS"
- System overlay reposicionado para canto inferior direito

### Corrigido

- launch.json com path incorreto do projeto

---

## [2.0.1] — 2026-03-29

### Resumo

**Security Hardening + Production Patterns.** 18 melhorias em 3 tiers: segurança (open redirect, auth em APIs, Zod validation, security headers, middleware cookie auth), fundação (Supabase SSR client, loading skeletons, error boundary prod-safe, 404 pages), maturidade (vitest no web app, husky typecheck, rate limiting, audit logging).

### Segurança

- Fix open redirect no auth callback — validação de `next` param contra `//` prefix
- Admin Config API protegida com autenticação Bearer token obrigatória
- Input validation com Zod schema `.strict()` no PATCH de admin config
- Middleware verifica cookies Supabase além do Authorization header
- DEMO_MODE bloqueado em `NODE_ENV=production`
- Env vars faltando retornam 503 em vez de bypass silencioso
- Security headers: X-Frame-Options DENY, X-Content-Type-Options nosniff, HSTS, Referrer-Policy, Permissions-Policy
- Error boundary oculta `error.message` em produção

### Adicionado

- `app/lib/supabase-server.ts` — Supabase server client com service role key
- `lib/rate-limit.ts` — Rate limiter in-memory com cleanup automático
- `lib/audit-log.ts` — Audit logging (console em dev, Supabase em prod)
- 3 `loading.tsx` — Skeletons server-side para Dashboard, Usuarios, Profile
- `(protected)/not-found.tsx` — 404 page para rotas protegidas
- `vitest.config.ts` + `vitest.setup.ts` — Setup de testes para web app
- `__tests__/middleware.test.ts` — 4 testes de segurança do middleware
- Husky pre-commit agora roda typecheck além de lint-staged

### Corrigido

- API client usa `supabase.auth.getSession()` em vez de `localStorage.getItem()`
- 401 handler faz `supabase.auth.signOut()` antes de redirect

---

## [2.0.0] — 2026-03-29

### Resumo

**Template.Base v2.0 — Supabase-First Production Starter.** Migração completa de Vite+FastAPI para Next.js 14 App Router + Supabase. Novo sistema de autenticação dual (Supabase Auth + Keycloak OIDC opcional), Google OAuth, setup wizard interativo, 4 migrações SQL com RLS, documentação completa e quality gates passando.

### Adicionado

- **Next.js 14 App Router** com Server Components, Middleware auth, e 16 rotas
- **Supabase Auth** como provider padrão com Google OAuth e PKCE callback
- **Dual Auth Provider** (Supabase + Keycloak OIDC) via AuthAdapter pattern
- **Demo Mode** (`NEXT_PUBLIC_DEMO_MODE=true`) para desenvolvimento local sem Supabase
- **Setup Wizard** interativo (`pnpm run setup`) + modo não-interativo (`--config`)
- **4 migrações SQL**: tenants, profiles, core_tables, rls_policies com Row Level Security
- **Supabase Realtime** (presence, broadcast, postgres_changes)
- **Supabase Storage** (buckets: avatars, attachments, public)
- **FirstRunWizard** com focus trap, 5 steps (Branding → Cores → Admin → Módulos → Resumo)
- **Dashboard** com 4 KPI cards, gráfico de atividade mensal, ações rápidas
- **Admin Config** com 4 sub-páginas: Geral, Aparência, Notificações, Integrações
- **Admin Usuários** com tabela, filtros, busca, paginação, modal de criação/edição
- **Perfil** com avatar, nome, bio, email readonly
- **Login** com Google OAuth, email/senha, esqueci minha senha
- **i18n** completo com pt-BR e en-US (react-i18next)
- **SEO** metadata template pattern com `title.template`
- **Route prefetching** no layout protegido
- **Documentação**: GETTING_STARTED, ARCHITECTURE, DEPLOY, CUSTOMIZATION

### Removido

- FastAPI backend (`api-template/`)
- Vite SPA (`apps/web/` antigo baseado em Vite)
- Dependências Python
- Credenciais hardcoded em `.env`

### Quality Gates

- TypeCheck: 0 erros (4 packages)
- ESLint: 0 erros
- Build: 16 rotas compiladas com sucesso
- Telas validadas: 10/10 via accessibility snapshots

---

## [1.2.10] — 2026-03-28

### Resumo

Sprint 52: Validação E2E Completa + Correção de Specs — Execução da suite E2E completa (**156/156 Chromium**, incluindo api-health com FastAPI). Correção de seletores em `sidebar.spec.ts`, `functions-panel.spec.ts` e `api-health.spec.ts`. Adicionado `tsconfig.json` para diretório `e2e/`.
**918 testes unitários FE**, **156 E2E Chromium**, 100% passando. Build ✅.

---

### Corrigido — Sprint 52

#### Validação E2E Completa (156/156 Chromium)

- `full-platform-validation.spec.ts`: 61/61 — todas as 23 rotas, componentes DS, tabs, paginação, search, toggles, dropdowns, tooltips, breadcrumbs, formulários
- `sidebar.spec.ts`: 10/10 — expand/collapse, groups, tooltips, navigation, mobile drawer
- `functions-panel.spec.ts`: 7/7 — search, favorites, accordions, close, highlight
- `navigation.spec.ts` + `navigation-routes.spec.ts`: 14/14 + 23/23 — navegação completa, deep links, teclado
- `performance.spec.ts`: 7/7 — carregamento, lazy loading, console, cache
- `template.spec.ts`: 9/9 — validação base, layout, autenticação demo
- `accessibility.spec.ts`: 5/5 + `forms.spec.ts`: 5/5
- `api-health.spec.ts`: 16/16 — health endpoints, security headers, request-id, config, CRUD tasks

#### Correção de E2E Specs

- `sidebar.spec.ts`: `getByText('PRINCIPAL')` → `getByText('Principal', { exact: true })` (texto DOM real, CSS uppercase)
- `sidebar.spec.ts`: global search test → fallback resiliente com `Ctrl+K`
- `functions-panel.spec.ts`: `beforeEach` → `waitForLoadState('networkidle')` + timeout
- `functions-panel.spec.ts`: seletores com `.first()` e `isVisible()` guards
- `functions-panel.spec.ts`: highlight test → busca direta por `div.bg-[var(--brand-primary)]` (evita match em recentes)
- `api-health.spec.ts`: `/api/config` → `/api/v1/platform/public-config`, `/api/security/config` → `/api/v1/security/config`

#### Infraestrutura E2E

- `e2e/tsconfig.json`: adicionado com `target: ES2020`, `lib: [ES2020, DOM]` — resolve lint errors de Promise

---

## [1.2.9] — 2026-03-28

### Resumo

Sprint 51: FirstRunWizard Persist + PageHeader DS Sweep — Dismiss do FirstRunWizard persistente em localStorage (demo mode). `PageHeader` DS integrado em 7 páginas adicionais (ETLQualityPage, LGPDPage, ConsentPage, MyDataPage, LogsPage, ApiDocsPage, ChangelogPage). **Total: 17 páginas com PageHeader DS.**
**918 testes FE**, 100% passando. Build ✅.

---

### Corrigido — Sprint 51

#### FirstRunWizard Dismiss Persistente

- `AppLayout`: dismiss do wizard persistido em `localStorage` via chave `wizard-dismissed`
- Em demo mode, o wizard não reaparece após reload quando já foi completado ou pulado

#### PageHeader DS Sweep (7 páginas adicionais)

- `ETLQualityPage`: header manual + actions → `PageHeader` DS com actions (Atualizar, Executar Checks)
- `LGPDPage`: header manual → `PageHeader` DS
- `ConsentPage`: header manual → `PageHeader` DS
- `MyDataPage`: header manual → `PageHeader` DS
- `LogsPage`: header manual + actions → `PageHeader` DS com actions (Exportar, Live)
- `ApiDocsPage`: header manual + action → `PageHeader` DS com action (Swagger UI)
- `ChangelogPage`: header manual → `PageHeader` DS

---

## [1.2.8] — 2026-03-28

### Resumo

Sprint 50: Token CSS Sweep + PageHeader DS — Migração massiva de ~130 classes hardcoded de cores cinza (`bg-gray-*`, `text-gray-*`, `border-gray-*`) para design tokens semânticos em 22+ arquivos. `PageHeader` DS integrado em 4 páginas (ConfigPage, UsersPage, DataQualityPage, ETLCatalogPage).
**918 testes FE**, 100% passando. Build ✅.

---

### Alterado — Sprint 50: Token CSS Sweep

#### Token Sweep (~130 ocorrências → 2 residuais intencionais)

Substituição sistemática de classes Tailwind hardcoded por tokens semânticos do Design System:

- `bg-white dark:bg-gray-800` → `bg-surface-elevated`
- `bg-gray-50 dark:bg-gray-900` → `bg-surface-muted`
- `text-gray-900 dark:text-white` → `text-text-primary`
- `text-gray-600 dark:text-gray-300` → `text-text-secondary`
- `text-gray-500 dark:text-gray-400` → `text-text-muted`
- `border-gray-200 dark:border-gray-700` → `border-border-default`
- `hover:bg-gray-50 dark:hover:bg-gray-700` → `hover:bg-surface-muted`

**22+ arquivos modificados**: AnalyticsDashboard, FirstRunWizard, LgpdPage, DocsPage (2), NavigationEditor, ApiDocsPage, RechartsWidgets, LanguageSwitcher, ChangelogPage, KpiCard, KanbanBoard, ConsentPage, GanttChart, TasksByStatusChart, TasksOverTimeChart, TenantSwitcher, LogsPage, DataQualityPage, LoginPage

**2 ocorrências residuais intencionais**: KpiCard (gray color variant), LogsPage (DEBUG level color map)

#### PageHeader DS (4 páginas)

- `ConfigPage`: header manual (icon + title + description) → `PageHeader` DS
- `UsersPage`: header manual + actions → `PageHeader` DS com `actions` prop
- `DataQualityPage`: header manual + 2 buttons → `PageHeader` DS com `actions` prop
- `ETLCatalogPage`: header manual → `PageHeader` DS

---

## [1.2.7] — 2026-03-28

### Resumo

Sprint 49: Tabs + StatusBadge DS — Últimos componentes DS integrados. `Tabs` DS no ConfigPage (4 abas, variant pills) e ETLPage (2 abas, variant line). `StatusBadge` DS na UsersPage (active/inactive) e DataQualityPage (passed/warning/failed/pending).
**918 testes FE**, 100% passando. Build ✅. **Integração completa de todos os componentes DS do design-system.**

---

### Adicionado — Sprint 49: Tabs + StatusBadge DS

#### Tabs DS (2 páginas)

- `ConfigPage`: 4 tabs manuais (buttons + activeTab state) → `Tabs`/`TabList`/`Tab`/`TabPanels`/`TabPanel` com variant `pills` e ícones
- `ETLPage`: 2 tabs manuais (border-b buttons) → `Tabs` DS com variant `line`

#### StatusBadge DS (2 páginas)

- `UsersPage`: status span inline (Ativo/Inativo) → `StatusBadge` variant success/pending
- `DataQualityPage`: check status span → `StatusBadge` variant success/warning/error/pending com ícone

---

## [1.2.6] — 2026-03-28

### Resumo

Sprint 48: Alert + Card + Pagination DS Integration — `Alert` DS no ErrorBoundary e HealthPage, `Card` DS no HealthPage/MetricsPage/KpiCard, `Pagination` DS na UsersPage com 12 mock users e paginação client-side.
**918 testes FE**, 100% passando. Build ✅.

---

### Adicionado — Sprint 48: Alert + Card + Pagination DS

#### Alert DS (2 componentes)

- `ErrorBoundary`: bloco de detalhes de erro (dev) → `Alert variant="error"` com título e stack trace
- `HealthPage`: banner de status geral → `Alert` com variant dinâmica (success/warning/error)

#### Card DS (3 componentes)

- `HealthPage`: health check cards → `Card variant="outlined" padding="none"`
- `MetricsPage`: `MetricCard` → `Card variant="outlined" padding="none"`
- `KpiCard`: wrapper div → `Card variant="elevated" padding="none"`

#### Pagination DS (1 página)

- `UsersPage`: adicionada `Pagination` DS com 12 mock users, 5 items/página, reset de página ao buscar

---

## [1.2.5] — 2026-03-28

### Resumo

Sprint 47: Table + Dropdown + Skeleton DS Integration — Substituição de tabelas HTML manuais por `Table` DS em 4 páginas, dropdown `group-hover` por `Dropdown` DS no DataSourceCard, e loading states por `Skeleton` DS no TeamManagement e KanbanBoard.
**918 testes FE**, 100% passando. Build ✅.

---

### Adicionado — Sprint 47: Table + Dropdown + Skeleton DS

#### Table DS (4 páginas)

- `UsersPage`: tabela de usuários (5 colunas, hoverable, striped)
- `ETLCatalogPage`: tabela de schema (4 colunas, size sm)
- `DataQualityPage`: tabela de checks de qualidade (6 colunas)
- `MetricsPage`: tabela de serviços (5 colunas)

#### Dropdown DS (1 componente)

- `DataSourceCard`: dropdown manual `group-hover` → `Dropdown` + `DropdownTrigger` + `DropdownMenu` + `DropdownItem` com ESC/click-outside + `destructive` no Excluir

#### Skeleton DS (2 componentes, 3 loading states)

- `TeamManagement`: team detail loading → `SkeletonText`, team list loading → `SkeletonCard`
- `KanbanBoard`: board loading → 3× `SkeletonCard` em flex

---

## [1.2.4] — 2026-03-26

### Resumo

Sprint 46: Tooltip & Breadcrumb DS Sweep — Substituição massiva de `title` nativos por `Tooltip` do DS em 4 componentes de layout/UI + integração do `Breadcrumb` do DS no Header.
**918 testes FE**, 100% passando. Build ✅.

---

### Adicionado — Sprint 46: Tooltip & Breadcrumb DS Sweep

#### Tooltip Integration (11 botões icon-only)

- `Header`: Menu, Panel toggle, Buscar (Ctrl+K), Theme toggle — 4 botões
- `NotificationCenter`: Bell, Mark all read, Clear all — 3 botões
- `Footer`: ETL & Dados, Configurações, Observabilidade — 3 links
- `DataSourceCard`: More options (MoreVertical) — 1 botão

#### Breadcrumb DS (Header)

- Breadcrumb manual (`<nav>` + spans + `/` separator) → `Breadcrumb` + `BreadcrumbItem` do DS
- Suporte a `current` para último segmento, separador `/`

#### Test Fixes

- `NotificationCenter.test.tsx`: `getByTitle` → `getByText` + `.closest('.ds-tooltip-wrapper')` para localizar botões dentro de Tooltips

---

## [1.2.3] — 2026-03-26

### Resumo

Sprint 45: DS Deep Integration + Toast Migration — Eliminação de `alert()` nativos, substituição de diálogos manuais por DS components, integração de `Avatar` e `Progress`.
**918 testes FE**, 100% passando. Build ✅.

---

### Adicionado — Sprint 45: DS Deep Integration

#### Toast Migration (4 componentes)

- `ModulesConfigPage`: `alert()` → `useToast` com severity `success`
- `FiltersConfigPage`: `alert()` → `useToast` com severity `success`
- `MyDataPage`: `alert()` → `useToast` com severity `success`
- `AnalyticsDashboard`: `alert()` → `useToast` com severity `info`

#### ConfirmDialog (MyDataPage)

- Diálogo manual de exclusão LGPD (div + overlay) → `ConfirmDialog` do DS com variant="danger" e children

#### Avatar (UsersPage)

- Div placeholder com iniciais manuais → `Avatar` do DS com prop `name` (gera iniciais automaticamente)

#### Progress (ETL JobProgress)

- Barra de progresso inline Tailwind → `Progress` do DS com variant="primary" e size="sm"

#### Backlog Cleanup

- CLI, i18n, Sentry marcados como ✅ no backlog (já entregues em sprints anteriores)

---

## [1.2.2] — 2026-03-26

### Resumo

Sprint 44: DS Integration — Integração dos novos componentes do Design System nas páginas existentes do `apps/web`.
Substituição de `window.confirm()` por `ConfirmDialog`, toggles inline por `Toggle`, `title` por `Tooltip`, e adição de FAQ com `Accordion`.
**918 testes FE + 366 testes DS = 1284 testes FE total**, 100% passando. Build ✅.

---

### Adicionado — Sprint 44: DS Integration

#### ConfirmDialog (3 páginas)

- `ModulesConfigPage`: `window.confirm()` → `ConfirmDialog` com variant="danger", estado `deleteTarget`
- `FiltersConfigPage`: `window.confirm()` → `ConfirmDialog` com variant="danger", estado `deleteTarget`
- `TeamManagement`: `window.confirm()` → `ConfirmDialog` com nome do time na descrição

#### Toggle (ConfigPage — 5 instâncias)

- `ConfigGeral`: toggle inline Tailwind → `Toggle` do DS (Modo de Manutenção)
- `ConfigNotificacoes`: 4 toggles inline → `Toggle` do DS (Email, Push, Alertas, Relatórios) com estado controlado

#### Tooltip (UsersPage)

- Botão icon-only "Mais opções" (`MoreVertical`) → `Tooltip` do DS com position="left"

#### Accordion (DocsPage)

- Seção FAQ com 5 perguntas frequentes usando `Accordion` do DS
- Conteúdo: criar módulos, Keycloak, testes, deploy, i18n

#### Docs atualizados

- `CHECKLIST-GERENCIAL.md`: Sprint DS entry, métricas atualizadas (44 sprints, 100+ stories)
- `BACKLOG-V1.1.md`: Sprint DS entry com detalhes completos
- Arquitetura: `packages/design-system/` adicionado ao diagrama

---

## [1.2.1] — 2026-03-26

### Resumo

Sprint Design System — Auditoria completa e expansão do `packages/design-system`.
**366 testes DS** (25 test files), **100% passando**. 10 novos componentes, 2 módulos preenchidos, CSS tokens sincronizados.

---

### Adicionado — Sprint DS: Design System Overhaul

#### Testes unitários (9 componentes)

- Button, Card, Dropdown, Input, Modal, Skeleton, Table, Tabs, Toast — todos com cobertura completa via Vitest + @testing-library/react

#### Stories Storybook (5 componentes)

- Dropdown, Modal, Table, Tabs, Toast — stories interativas com variantes, tamanhos e estados

#### Acessibilidade Modal

- `useId()` para IDs únicos (aria-labelledby, aria-describedby)
- Focus trap real via `onKeyDown` (Tab cycling dentro do modal)
- Suporte a múltiplos modais simultâneos com IDs independentes

#### Componentes Lote 1 (6 novos)

- **Tooltip**: posições (top/bottom/left/right), delay configurável, disabled
- **Avatar + AvatarGroup**: imagem, iniciais, fallback, tamanhos (xs–xl), shapes, max overflow
- **Breadcrumb + BreadcrumbItem**: separadores, aria-current, href/button/span
- **Progress**: barra de progresso, variantes (primary/success/warning/error), striped, animated
- **Pagination + usePaginationRange**: navegação paginada, ellipsis, prev/next, tamanhos
- **Toggle**: switch acessível com role="switch", aria-checked, tamanhos, label

#### Componentes Lote 2 (4 novos)

- **Textarea**: label, helper, error, counter, resize control, tamanhos, ref forwarding
- **Select**: options tipadas, placeholder, disabled options, tamanhos, ref forwarding
- **Accordion**: single/multiple mode, controlado/não-controlado, disabled items, ARIA regions
- **ConfirmDialog**: variantes (danger/warning/info), ícones, loading state, baseado no Modal

#### Módulos preenchidos (navigation + filters)

- **NavLink + NavGroup**: links de navegação com ícones, badges, active state, grupos com labels
- **SearchFilter + FilterChip**: campo de busca com clear, chips de filtro com remove

#### CSS Tokens

- `src/styles/tokens.css`: 200+ CSS custom properties sincronizadas com os TS tokens
- Cores (brand, semantic, neutral), surfaces, text, borders, spacing, radius, shadows, z-index, typography, animation
- Dark mode via `[data-theme="dark"]` / `.dark`

#### Barrel exports atualizados

- `src/components/index.ts`: +10 componentes exportados
- `src/navigation/index.ts`: NavLink, NavGroup
- `src/filters/index.ts`: SearchFilter, FilterChip

---

## [1.2.0] — 2026-03-26

### Resumo

Release 1.2.0 — File Upload full-stack, Generic Form Components, Docker Production, Kanban/Gantt, i18n enhancements, WebSocket Notifications, 30+ Storybook stories, Recharts widgets, PWA nav caching, CLI scaffolding, dark mode polish.
**1.777 testes totais** (917 backend + 860 frontend), **100% passando**. 13/13 TDs resolvidos. 43 sprints entregues.

---

### Adicionado — Sprints 33–36

#### Sprint 33: Dívida Técnica + Qualidade

- `api-template/app/cache.py`: circuit breaker — threshold (5), cooldown (30s), half-open probe, graceful defaults
- `api-template/tests/test_session.py`: +14 testes (get_session_store, SESSION_COOKIE, RedisSessionStore, edge cases)
- `apps/web/vitest.config.ts`: FE coverage threshold formal (40% statements/branches/functions/lines)
- **TD-003 resolvido**, **TD-012 resolvido**

#### Sprint 34: Generic Form Components

- `apps/web/src/components/forms/FormInput.tsx`: label, hint, error, aria-invalid, aria-describedby, required asterisk
- `apps/web/src/components/forms/FormSelect.tsx`: options, placeholder, disabled options, label, error, hint
- `apps/web/src/components/forms/FormTextarea.tsx`: character count, maxLength, label, error, hint
- `apps/web/src/components/forms/FileUpload.tsx`: drag & drop, size validation, accept filter, disabled, keyboard accessible
- `apps/web/src/components/forms/index.ts`: barrel export
- **60 testes FE** + **23 stories Storybook** (4 novos arquivos de stories)

#### Sprint 35: File Upload Backend

- `api-template/app/routers/file_upload.py`: POST upload (multipart), GET metadata, GET list (paginação + tag filter), DELETE, POST presigned URL
- Schemas Pydantic: `FileMetadata`, `FileListResponse`, `PresignedUrlRequest`, `PresignedUrlResponse`
- Validação de extensão (14 tipos) e tamanho máximo (10MB configurável via `MAX_FILE_SIZE_MB`)
- `python-multipart` adicionado ao `requirements.txt`
- **17 testes BE**

#### Sprint 36: File Upload Frontend + TD-008

- `apps/web/src/services/fileUpload.ts`: service layer axios (upload c/ progress, getMetadata, list, delete, getPresignedUrl)
- `apps/web/src/hooks/useFileUpload.ts`: TanStack Query hooks (useFileUpload c/ progress, useFileList, useFileMetadata, useFileDelete)
- `api-template/scripts/seed.py`: reescrito com async SQLAlchemy real DB (Tenant, User, Task) + flag `--dry-run`
- **TD-008 resolvido**
- **22 testes FE** (9 service + 13 hooks)

#### Sprint 37: PWA + TD-009/010 + CHANGELOG

- Este CHANGELOG atualizado para v1.1 e v1.2
- PWA foundation: `manifest.json`, service worker registration, offline fallback
- **TD-009 resolvido** (useFocusTrap E2E doc/test)
- **TD-010 resolvido** (debugpy em requirements-dev.txt)

#### Sprint 38: Docusaurus Portal + Storybook Deploy

- **Docusaurus 3.7** portal criado em `apps/docs/` com 22 páginas de documentação
- Seções: Intro, Getting Started, Project Structure, Configuration, Architecture, Multi-Tenancy, Auth, Security
- Frontend docs: Overview, Components, Hooks, State Management, i18n, PWA
- Backend docs: Overview, Routers, Models, Cache, Observability
- API Reference: Tasks, Users, Files, Admin Config, Feature Flags
- Guides: New Module, Testing, Deployment, Contributing
- Custom CSS com tema `#14b8a6` (teal) + dark mode
- Sidebar hierárquica com 6 categorias
- **GitHub Pages workflow** (`deploy-docs.yml`): Docusaurus + Storybook deploy automático
- Scripts `pnpm docs` e `pnpm docs:build` no root package.json

#### Sprint 39: Team Collaboration

- **BE**: Models `Team`, `TeamMember`, `TeamInvite` + enums `TeamRole`, `InviteStatus` em `app/models/team.py`
- **BE**: Router `/api/teams` — 15 endpoints (CRUD teams, add/remove/change-role members, send/list/accept/decline invites)
- **BE**: Router registrado em `main.py` — **35 novos testes BE**
- **FE**: `teamsService` — API client tipado (CRUD, members, invites) em `services/teams.ts`
- **FE**: 11 TanStack Query hooks em `hooks/useTeams.ts` (useTeamList, useTeamDetail, useCreateTeam, useUpdateTeam, useDeleteTeam, useAddMember, useRemoveMember, useChangeMemberRole, useSendInvite, useTeamInvites, useUpdateInvite)
- **FE**: `TeamManagement` component (team list, detail panel, member mgmt, invite mgmt) com Tailwind + dark mode
- **42 novos testes FE** (14 service + 22 hooks + 6 component)
- Total: **880 BE + 810 FE = 1690 testes**

#### Sprint 40: Project Management (Kanban + Gantt)

- **BE**: Models `Board`, `BoardColumn`, `Card` + enum `CardPriority` em `app/models/board.py`
- **BE**: Router `/api/boards` — 14 endpoints (CRUD boards, columns create/update/delete/reorder, cards create/update/delete/move)
- **BE**: Router registrado em `main.py` — **37 novos testes BE**
- **FE**: `boardsService` — API client tipado (CRUD boards, columns, cards, move) em `services/boards.ts`
- **FE**: 12 TanStack Query hooks em `hooks/useBoards.ts` (useBoardList, useBoardDetail, useCreateBoard, useUpdateBoard, useDeleteBoard, useCreateColumn, useUpdateColumn, useDeleteColumn, useReorderColumns, useCreateCard, useUpdateCard, useDeleteCard, useMoveCard)
- **FE**: `KanbanBoard` component — columns with cards, inline edit, move dropdown, WIP limit, priority colors
- **FE**: `GanttChart` component — timeline visualization with date bars, progress overlay, priority legend
- **50 novos testes FE** (14 service + 21 hooks + 8 Kanban + 7 Gantt)
- Total: **917 BE + 860 FE = 1777 testes**

#### Sprint 42: Docker Production Stack + SQLAlchemy Migration

- **Infra**: 5 containers Docker Compose healthy (PostgreSQL 15, Redis 7, Keycloak 23, FastAPI, Nginx)
- **Bug fixes**: nginx proxy_pass strip bug, VITE_API_URL double `/api/` prefix, python-multipart version
- **BE**: Health checks reais (database SELECT 1, Redis PING, Keycloak OIDC well-known) com latência
- **BE**: CORS dinâmico via `CORS_ORIGINS` env var + startup Alembic migrations em produção
- **Nginx**: WebSocket proxy `/ws`, health/docs proxy, API proxy com path preservado
- **Keycloak**: Realm `template` importado, demo user `admin@template.com` login funcional com JWT
- **Deps**: `aiosqlite`, `gunicorn` adicionados; `python-multipart` versão corrigida
- **CRITICAL FIX**: `teams.py` migrado de in-memory dicts para SQLAlchemy `AsyncSession` (15 endpoints)
- **CRITICAL FIX**: `boards.py` migrado de in-memory dicts para SQLAlchemy `AsyncSession` (14 endpoints)
- **BE**: `_ensure_default_tenant()` — idempotent `INSERT ... ON CONFLICT DO NOTHING` para FK constraints
- **BE**: `BoardColumn` — removida `UniqueConstraint("board_id", "position")` para permitir reordering
- **Tests**: `test_teams.py` e `test_boards.py` migrados para SQLAlchemy test DB (`sqlite+aiosqlite`) com `get_db` override
- **Validação**: 917 BE + 860 FE testes passando + Docker stack 100% operacional + dados persistem após restart

#### Sprint 43: i18n + Notifications + Storybook + Recharts + PWA + CLI + Dark Mode

- **FE**: i18n namespace `sidebar` registrado em `i18n/index.ts` + locale JSONs (pt-BR/en-US)
- **FE**: `LanguageSelector` component (Globe icon, dropdown, compact mode) integrado no Header
- **FE**: `ToastProvider` context — global toast notification state management
- **FE**: `NotificationCenter` component — bell icon dropdown, unread badge, mark read/dismiss/clear
- **FE**: `useNotifications` hook — WebSocket wiring, localStorage persistence, auto-dismiss
- **FE**: Header wired com NotificationCenter + LanguageSelector (substituem bell button antigo)
- **E2E**: Playwright 3 spec files: `sidebar.spec.ts`, `functions-panel.spec.ts`, `navigation-routes.spec.ts`
- **Storybook**: +13 story files → **30 story files total** (AppSidebar, Header, ModuleFunctionsPanel, LanguageSelector, LanguageSwitcher, NotificationCenter, ToastProvider, FirstRunWizard, GlobalSearch, RechartsWidgets, AnalyticsDashboard, KanbanBoard, GanttChart)
- **CSS**: Dark Mode Polish — `--brand-primary-hover` (light #006d8a / dark #3bc9db), dark shadow overrides, WCAG AA contrast
- **FE**: `RechartsWidgets.tsx` — TrafficAreaChart, ModuleUsageBarChart, UserRolesPieChart, DashboardCharts composite
- **PWA**: `sw.js` v2 — NAV_ROUTES pre-caching for offline SPA navigation (9 routes)
- **CLI**: `scripts/scaffold-module.mjs` — module generator (pages, services, hooks, function pages) with `--functions` flag
- **Validação**: 917 BE + 860 FE = **1777 testes passando** + build ✅

#### Sprint 41: API Versioning (`/api/v1/`)

- **BE**: `api-template/app/api_version.py` — versioning module com:
  - `API_V1_PREFIX`, `CURRENT_API_VERSION`, `SUPPORTED_VERSIONS` constants
  - `APIVersionHeaderMiddleware` — adds `X-API-Version`, `X-API-Semver`, `X-API-Supported-Versions` headers
  - `deprecated_endpoint()` decorator + `add_deprecation_headers()` utility (Deprecation, Sunset, Link headers)
  - `get_requested_version()` — version negotiation (URL path → header → Accept param)
  - `is_version_supported()` — validation helper
- **BE**: Padronização de TODOS os routers para `/api/v1/` prefix:
  - `teams.py`: `/api/teams` → `/api/v1/teams`
  - `boards.py`: `/api/boards` → `/api/v1/boards`
  - `file_upload.py`: `/api/files` → `/api/v1/files`
  - `feature_flags.py`: `/api/feature-flags` → `/api/v1/feature-flags`
  - `admin_config` registration: `prefix="/api"` → `prefix="/api/v1"`
  - App endpoints: `/api/me`, `/api/config`, `/api/security/config` → `/api/v1/...`
- **BE**: CORS `expose_headers` atualizado com `X-API-Version`, `X-API-Semver`, `X-API-Supported-Versions`
- **BE**: 7 test files atualizados (test_teams, test_boards, test_file_upload, test_feature_flags_router, test_main, test_security, test_middleware, test_rate_limit)
- **FE**: Services atualizados para paths relativos (apiClient baseURL já inclui `/api/v1`):
  - `teams.ts`: `/api/teams/...` → `/teams/...`
  - `boards.ts`: `/api/boards/...` → `/boards/...`
  - `fileUpload.ts`: baseURL atualizado + `/api/files/...` → `/files/...`
- **FE**: 3 test files atualizados (teams.test.ts, boards.test.ts, fileUpload.test.ts)
- **Validação**: 916 BE + 860 FE = 1776 testes passando + build ✅

---

## [1.1.0] — 2026-03-25

### Resumo

Release 1.1.0 — WebSocket, i18n, Storybook, Observabilidade, CLI scaffolding.
**1.480 testes totais** (801 backend + 679 frontend), **100% passando**. 32 sprints concluídos.

---

### Adicionado — Sprints 25–32

#### Sprint 25: Segurança + Cobertura

- `MemoryCache` LRU com `max_size` (TD-002), CSRF startup validation (TD-004), admin auth `require_roles("ADMIN")` (TD-006)
- Testes: `test_analytics.py` (91%), `test_websocket.py` (71%), `test_tenant.py` (83%) — TD-011 resolvido
- Cobertura BE: 69% → 85%

#### Sprint 26: WebSocket + Notifications

- `api-template/app/websocket.py`: WebSocket wiring BE + `setup_websocket(app)`
- `apps/web/src/hooks/useWebSocket.ts`: WebSocket hook + `NotificationContext` + Toast/useToast FE
- **53 novos testes FE**

#### Sprint 27: TenantSwitcher + Feature Flags

- `apps/web/src/components/common/TenantSwitcher.tsx`: FE tenant switcher
- `api-template/app/routers/feature_flags.py`: Feature Flags BE + Alembic migration
- TD-005 (AdminConfigStore → PostgreSQL), TD-007 (offline cache) resolvidos
- **93 novos testes** (61 BE + 32 FE)

#### Sprint 28: Dashboard Interativo

- Recharts: `TasksByStatusChart` (bar), `TasksOverTimeChart` (line), `KpiCard` (trend + spark bars)
- `NavigationEditor` drag-and-drop (HTML5 nativo, add/remove/toggle)
- **45 novos testes FE**

#### Sprint 29: Storybook

- Storybook 8.6 — **54 stories** em 13 arquivos (meta 30+)
- Design Tokens docs: Colors, Spacing, BorderRadius, Typography

#### Sprint 30: i18n

- `i18next` + `react-i18next` + language detector — 4 namespaces × 2 idiomas = 8 files, 120+ chaves
- `LanguageSwitcher` component — **24 novos testes**

#### Sprint 31: Observabilidade

- `api-template/app/observability.py`: Sentry SDK + `MetricsStore` Prometheus-style + `MetricsMiddleware`
- Router `/metrics` (GET/status/reset) — **39 novos testes** (27 BE + 12 FE)

#### Sprint 32: CLI Scaffolding

- `scripts/new-module.js`: full-stack scaffolding (FE + BE), flags `--fe-only`, `--be-only`, `--dry-run`
- **48 testes CLI**

---

## [1.0.0] — 2026-03-25

### Resumo

Release 1.0.0 da Template Platform. Plataforma madura para uso como base de produtos corporativos.
**1130 testes totais** (617 backend + 513 frontend), **100% passando**.

---

### Adicionado — Sprints 19–24

#### Sprint 19: Performance e Otimização

- `apps/web/vite.config.ts`: chunk splitting manual por biblioteca (react-vendor, query, router, auth, zod, axios, shared, design-system); target `es2020`; `chunkSizeWarningLimit` 400KB
- `apps/web/src/hooks/usePerformance.ts`: hooks `usePrefetchQuery`, `useDebounce`, `useThrottle`, `useMeasureRender`, `useWebVitals`, `useIntersectionPrefetch`
- `api-template/app/cache.py`: `MemoryCache` (sync), `RedisCache` (async), `create_cache()` factory, `make_cache_key()`, `invalidate_by_prefix()`, `CacheStats`
- **17 testes** frontend performance + **52 testes** backend cache

#### Sprint 20: Acessibilidade (WCAG 2.1 AA)

- `apps/web/src/hooks/useA11y.ts`: `useAnnouncer`, `useFocusTrap`, `useKeyboardNavigation`, `useId`, `useAriaDescribedBy`, `useReducedMotion`, `useHighContrast`
- Utilitários WCAG: `relativeLuminance()`, `contrastRatio()`, `meetsContrastRequirement()`, `hexToRgb()`
- **53 testes** cobrindo todos os hooks e utilitários de contraste

#### Sprint 21: Segurança Hardening

- `api-template/app/csrf.py`: `CSRFMiddleware` (double-submit cookie), `generate_csrf_token()`, `validate_csrf_token()`, `setup_csrf_protection()`, endpoint `/api/csrf-token`
- `api-template/app/security.py`: `CSPBuilder`, `ContentSecurityPolicyMiddleware`, headers `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` (produção)
- **35 testes** CSRF + **32 testes** CSP/headers

#### Sprint 22: Developer Experience (DX) Polish

- `.vscode/settings.json`: formatação, ESLint workingDirectories, Python interpreter, exclusões de busca
- `.vscode/extensions.json`: 17 extensões recomendadas (Prettier, ESLint, Python, Tailwind, Vitest, Playwright, Docker)
- `.vscode/launch.json`: 5 configurações de debug (Vite, FastAPI, pytest all, pytest current, Playwright) + compound Full Stack
- `.gitignore`: exceções para `.vscode/settings.json`, `.vscode/extensions.json`, `.vscode/launch.json`
- `package.json`: novos scripts `test:run`, `test:backend`, `test:all`, `db:migrate`, `db:migrate:down`, `db:seed`, `db:reset`, `storybook`, `storybook:build`, `e2e`, `e2e:ui`
- **50 testes** DX validando existência e integridade de todos os arquivos de configuração

#### Sprint 23: Admin & White-Label Configuration

- `apps/web/src/services/adminConfig.ts`: tipos `BrandingConfig`, `ThemeConfig`, `NavigationItem`, `NotificationConfig`, `PlatformConfig`; `mergeConfig()`, `validateBranding()`, `validateTheme()`, `validateNavigationItem()`; helpers `reorderNavigation()`, `toggleNavigationItem()`, `addNavigationItem()`, `removeNavigationItem()`; `adminConfigService` (API client)
- `api-template/app/admin_config.py`: `validate_branding()`, `validate_theme()`, `validate_config()`, `merge_config()`, helpers de navegação, `AdminConfigStore` multi-tenant (in-memory, substituível por DB)
- **52 testes** frontend + **68 testes** backend admin config

#### Sprint 24: Release 1.0

- `README.md`: versão atualizada, seção Sprint 19-24, tabela de scripts completa (17 comandos), contagem de testes
- `CHANGELOG.md`: este arquivo
- `todo.md`: atualizado com todas as sprints concluídas

---

### Adicionado — Sprints 1–18 (base)

#### Fundação (Sprints 1–7)

- Monorepo pnpm 9.x com `apps/web`, `packages/shared`, `packages/design-system`, `packages/types`
- React 18 + TypeScript 5.3 + Vite 5 + TailwindCSS 3
- FastAPI backend com PostgreSQL + SQLAlchemy + Alembic
- TanStack Query v5 para estado servidor
- Design System com `Button`, `Card`, `Badge`, `TaskCard`, `TaskBadge`, `TaskForm`
- Vitest + React Testing Library (fundação de testes unitários)

#### Qualidade e E2E (Sprints 8–9)

- Playwright E2E (96 testes)
- WebSocket (base)

#### Multi-tenancy e Features (Sprints 10–13)

- Multi-tenancy real: `TenantRouter`, `TenantMiddleware`, `TenantContext`
- Dashboard e relatórios com `useDashboard`, `useFilters`
- Formulários complexos com Zod (`task.schema.ts`)
- Alembic migrations + GitHub Actions CI/CD

#### Autenticação e Segurança (Sprints 14–18)

- JWT middleware + `ProtectedRoute` + permissions (90 testes)
- Users CRUD API + `useUsers` hook (55 testes)
- Feature Flags + `/health/detailed` (47 testes)
- RLS (Row-Level Security) + Audit Log (65 testes)
- Session Store Redis + Rate Limiting avançado (53 testes)

---

### Cobertura de Testes — Release 1.0

| Módulo                        | Testes   | Cobertura |
| ----------------------------- | -------- | --------- |
| Backend (pytest total)        | 609      | 69%       |
| `app/admin_config.py`         | 68       | 100%      |
| `app/routers/admin_config.py` | 29       | 99%       |
| `app/csrf.py`                 | 35       | 97%       |
| `app/security.py`             | 32       | 97%       |
| `app/cache.py`                | 52       | 61%       |
| `app/audit.py`                | —        | 90%       |
| `app/auth.py`                 | —        | 94%       |
| `scripts/seed.py`             | 40       | —         |
| Frontend (Vitest total)       | 412      | —         |
| `useA11y`                     | 53       | —         |
| `useDX` (config files)        | 50       | —         |
| `adminConfig` service         | 52       | —         |
| `FirstRunWizard`              | 40       | —         |
| `SkipLink`                    | 8        | —         |
| `usePerformance`              | 17       | —         |
| **Total geral**               | **1021** | —         |

---

### Stack de Tecnologias

| Camada          | Tecnologia     | Versão |
| --------------- | -------------- | ------ |
| Frontend        | React          | 18.x   |
| Linguagem       | TypeScript     | 5.3.x  |
| Build           | Vite           | 5.x    |
| Estilização     | TailwindCSS    | 3.x    |
| Estado servidor | TanStack Query | 5.x    |
| Auth            | oidc-client-ts | 2.x    |
| API             | FastAPI        | 0.104+ |
| ORM             | SQLAlchemy     | 2.x    |
| Migrations      | Alembic        | 1.x    |
| Cache           | Redis          | 7.x    |
| Testes E2E      | Playwright     | 1.x    |
| Testes unit FE  | Vitest + RTL   | 4.x    |
| Testes unit BE  | pytest         | 9.x    |
| Package Manager | pnpm           | 9.x    |
| CI/CD           | GitHub Actions | —      |
| Containers      | Docker Compose | —      |
| Auth Server     | Keycloak       | 23.x   |

---

[1.0.0]: https://github.com/seu-org/template-platform/releases/tag/v1.0.0
