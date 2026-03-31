---
sidebar_position: 2
title: Testes
---

# Testes

## Visão Geral

| Tipo        | Framework      | Localização                    | Comando                     |
| ----------- | -------------- | ------------------------------ | --------------------------- |
| **Unit FE** | Vitest + RTL   | `apps/web/src/**/*.test.ts(x)` | `pnpm -C apps/web test:run` |
| **E2E**     | Playwright     | `apps/web/e2e/*.spec.ts`       | `pnpm e2e`                  |
| **CLI**     | Node.js assert | `scripts/*.test.js`            | `pnpm create-module:test`   |

## Frontend (Vitest)

```bash
pnpm -C apps/web test:run          # Run once
pnpm -C apps/web test              # Watch mode
pnpm -C apps/web test:coverage     # Com cobertura
```

### Convenções

- Testes junto ao arquivo: `MyComponent.test.tsx`
- Setup global: `apps/web/src/test/setup.ts`
- Coverage threshold: 40% (statements, branches, functions, lines)

### Mocking Pattern

```tsx
// vi.hoisted() para mocks que precisam ser declarados antes de vi.mock()
const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('axios', () => ({
  default: { create: () => ({ get: mocks.get, post: mocks.post }) },
}))
```

## E2E (Playwright)

```bash
pnpm e2e              # Headless
pnpm e2e:ui           # UI mode (interativo)
```

### Spec Files

| Arquivo                 | Testes                                         |
| ----------------------- | ---------------------------------------------- |
| `accessibility.spec.ts` | Landmarks, headings, alt text, focus           |
| `focus-trap.spec.ts`    | Tab cycle, Shift+Tab, Escape, focus indicators |
| `navigation.spec.ts`    | Routing, sidebar links                         |
| `forms.spec.ts`         | Form validation, submission                    |
| `performance.spec.ts`   | Load time, bundle checks                       |

## Executar Todos

```bash
pnpm test:all   # FE (Vitest) + E2E (Playwright)
```
