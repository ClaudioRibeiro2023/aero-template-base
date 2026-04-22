# Module Starters

Biblioteca de módulos prontos para copiar em projetos instanciados a partir do `template.base`.

Cada módulo contém **tudo** que o module system precisa:

- `manifest.ts` — registro no module registry (dependências, rotas, tabelas, sidebar)
- `app/` — páginas Next.js App Router
- `api/route.ts` — API route com auth + rate-limit + logging
- `components/` — componentes React do módulo
- `hooks/` — React hooks
- `services/` — API client functions
- `types.ts` — tipos TypeScript

## Módulos disponíveis

| Módulo          | Categoria | Descrição                                                    |
| --------------- | --------- | ------------------------------------------------------------ |
| `_template`     | -         | Template mínimo para criar novos módulos via scaffold        |
| `exemplo`       | optional  | CRUD completo de referência com hooks, services, tipos       |
| `etl`           | optional  | Pipeline ETL — catálogo, qualidade, logs, jobs de importação |
| `lgpd`          | optional  | LGPD/Privacidade — consentimento, meus dados, exportação     |
| `observability` | optional  | Métricas, logs, health check, qualidade de dados             |
| `docs`          | optional  | Documentação interna integrada com API docs e changelog      |

## Como usar

### Opção 1 — Via scaffold (recomendado)

```bash
# Cria um módulo novo do zero
node scripts/scaffold-module.mjs <nome>

# Cria um módulo a partir de um starter
node scripts/scaffold-module.mjs <nome> --from etl
```

### Opção 2 — Cópia manual

1. Copie a pasta do módulo desejado para `apps/web/app/(protected)/<nome>/`
2. Copie `manifest.ts` para `apps/web/config/modules/<nome>.manifest.ts`
3. Copie `api/route.ts` para `apps/web/app/api/<nome>/route.ts`
4. Registre o módulo em `apps/web/config/modules/index.ts`
5. Ative em `apps/web/modules.config.ts`
6. Execute `pnpm run db:migrate` se o módulo tem `requiredTables`

## Estrutura de um módulo starter

```
meu-modulo/
├── manifest.ts              # Registro no module system
├── app/
│   └── page.tsx             # Página principal (App Router)
├── api/
│   └── route.ts             # GET + POST com auth + rate-limit
├── components/
│   ├── index.ts             # Barrel
│   └── MeuModuloCard.tsx    # Componentes
├── hooks/
│   ├── index.ts
│   └── useMeuModulo.ts      # Hooks React
├── services/
│   ├── index.ts
│   └── meu-modulo.service.ts # API client
└── types.ts                 # Tipos TypeScript
```
