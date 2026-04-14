# Template.Base — Backlog

Itens remanescentes classificados por prioridade.
Nenhum destes bloqueia o uso do template para criar novas aplicacoes.

## Alta Prioridade

- [ ] **Database migrations CI** — rodar `supabase db push` automaticamente no pipeline
- [ ] **Nonce-based CSP** — substituir `strict-dynamic` por nonces para CSP mais restritiva
- [ ] **Bundle analysis** — integrar `@next/bundle-analyzer` no CI com budget de 200KB gzipped
- [ ] **Lighthouse CI** — rodar Lighthouse em PRs com thresholds de performance

## Media Prioridade

- [ ] **Storybook build** — configurar Storybook para componentes do design-system
- [ ] **API response compression** — habilitar gzip/brotli para respostas JSON grandes
- [ ] **Retry logic no QueryClient** — exponential backoff para falhas de rede
- [ ] **Cursor-based pagination** — migrar paginacao offset-based para cursor-based
- [ ] **OpenAPI spec** — gerar spec automaticamente a partir dos API routes

## Baixa Prioridade

- [ ] **Service Worker** — cache offline para assets estaticos (PWA manifest ja existe)
- [ ] **RTL layout** — CSS logical properties para suporte a idiomas RTL
- [ ] **Dark mode auto-detection** — respeitar `prefers-color-scheme` do OS
- [ ] **Error tracking client-side** — Sentry browser SDK com replay
- [ ] **Optimistic updates** — `onMutate` com rollback nos hooks de mutacao

## Concluido (removido do backlog)

- [x] Role hardcoded como VIEWER
- [x] DEMO_MODE sem guard de producao
- [x] Pagina reset-password faltando
- [x] CSP unsafe-inline em script-src
- [x] CI artifact path errado
- [x] global-error.tsx faltando
- [x] Sentry ativavel por env var
- [x] Rate limiter plugavel (Upstash)
- [x] Light mode variaveis incompletas
- [x] CSS duplicado entre auth pages
- [x] Coverage threshold 60% → 70%
- [x] CSRF estrategia documentada
- [x] Keycloak referencias removidas
- [x] PWA manifest minimo
- [x] E2E no pipeline de CI
