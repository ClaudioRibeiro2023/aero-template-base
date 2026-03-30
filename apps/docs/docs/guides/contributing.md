---
sidebar_position: 4
title: Contribuindo
---

# Contribuindo

## Workflow

1. **Branch** a partir de `main`: `git checkout -b feature/minha-feature`
2. **Implemente** seguindo as convenções do projeto
3. **Testes**: adicione testes para toda nova funcionalidade
4. **Lint**: `pnpm lint` (sem erros)
5. **Build**: `pnpm build` (sem erros)
6. **Commit**: use [Conventional Commits](https://www.conventionalcommits.org/)
7. **PR**: abra Pull Request com descrição clara

## Conventional Commits

```
feat: adiciona componente FileUpload
fix: corrige validação de tamanho no upload
docs: atualiza documentação de API
test: adiciona testes para useFileUpload
refactor: simplifica circuit breaker no cache
chore: atualiza dependências
```

## Estrutura de PR

```markdown
## O que foi feito

- Implementado componente X
- Adicionados 15 testes

## Como testar

1. `pnpm test:run`
2. Abrir Storybook: `pnpm storybook`

## Screenshots (se UI)

[anexar imagens]
```

## Padrões de Código

### Frontend

- **TypeScript strict** — sem `any` implícito
- **Componentes funcionais** — sem class components
- **Hooks para lógica** — extrair em custom hooks
- **TanStack Query** — para todo server state
- **Tailwind** — sem CSS inline ou styled-components

### Backend

- **Type hints** em todas as funções
- **Pydantic schemas** para validação de input/output
- **Async** por padrão (SQLAlchemy async, Redis async)
- **Testes**: mínimo 80% cobertura para novos módulos

## Ferramentas

| Ferramenta            | Propósito               |
| --------------------- | ----------------------- |
| `pnpm create-module`  | Scaffold de novo módulo |
| `pnpm storybook`      | Design system visual    |
| `pnpm test:all`       | Todos os testes         |
| `pnpm lint`           | ESLint check            |
| VSCode launch configs | Debug FE + BE           |
