# @template/shared

Pacote compartilhado do Template.Base — agrupa utilitários, clientes e domínios transversais.
Cada subdiretório de `src/` representa um **subdomínio** com responsabilidade única.

## Subdomínios

| Subdomínio | Responsabilidade |
|---|---|
| `api/` | Cliente HTTP (fetch wrapper), interceptors e circuit breaker |
| `auth/` | Helpers de autenticação e sessão Supabase |
| `branding/` | Resolução de cores-pilar e tema do tenant |
| `cache/` | Configuração do React Query (QueryClient, cache times, query keys) |
| `collaboration/` | Presença, indicadores de edição em tempo real |
| `export/` | Exportadores CSV, Excel e PDF |
| `features/` | Feature flags e roll-out por tenant |
| `realtime/` | Wrappers de canais Supabase Realtime |
| `schemas/` | Schemas Zod compartilhados (validação) |
| `storage/` | Upload e assinatura de URLs Supabase Storage |
| `supabase/` | Factory de clientes Supabase (browser/server/service) |
| `utils/` | Utilitários puros (formatação, datas, strings, logger) |

## Imports

```ts
// Barrel completo
import { apiClient, queryClient } from '@template/shared'

// Subdomínio específico (recomendado — tree-shake mais agressivo)
import { apiClient } from '@template/shared/api'
import { queryClient } from '@template/shared/cache'
```

## Critérios de split futuro

O pacote hoje concentra 12 subdomínios para manter overhead de build baixo.
Candidatos a virarem packages próprios quando o escopo crescer:

- `@template/supabase-kit` ← `supabase/` + `auth/` + `storage/`
- `@template/collab-kit` ← `collaboration/` + `realtime/`
- `@template/feature-system` ← `features/`

Até lá, cada subdiretório deve:
1. Ter `index.ts` de barrel com exports nomeados explícitos.
2. Conter apenas dependências já declaradas no `package.json` deste pacote.
3. Evitar imports circulares entre subdomínios irmãos.
