# OpenAPI / API Routes

> Documentação da API REST via Next.js API Route Handlers.

---

## Acesso à Documentação

### OpenAPI Schema (JSON)

```
http://localhost:3000/api/openapi.json
```

Schema OpenAPI 3.0 para geração de clientes ou importação em ferramentas.

### Swagger UI (opcional)

Se configurado via `next-swagger-doc` ou similar:

```
http://localhost:3000/api-docs
```

---

## Estrutura das API Routes

**Fonte:** `apps/web/app/api/`

```
app/api/
├── health/
│   └── route.ts          # Health check endpoint
├── openapi.json/
│   └── route.ts          # OpenAPI schema (se implementado)
└── [resource]/
    ├── route.ts           # GET (list), POST (create)
    └── [id]/
        └── route.ts       # GET (detail), PUT (update), DELETE
```

---

## Gerar Cliente a partir do OpenAPI

### TypeScript (openapi-typescript)

```bash
# Instalar
npm install -D openapi-typescript

# Gerar tipos
npx openapi-typescript http://localhost:3000/api/openapi.json -o src/types/api.d.ts
```

### Supabase Types (recomendado)

```bash
# Gerar tipos diretamente do Supabase
npx supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

### Outras Ferramentas

| Ferramenta        | Linguagem  | Link                                      |
| ----------------- | ---------- | ----------------------------------------- |
| openapi-generator | Multi      | https://openapi-generator.tech/           |
| swagger-codegen   | Multi      | https://swagger.io/tools/swagger-codegen/ |
| orval             | TypeScript | https://orval.dev/                        |

---

## Validar Schema

### Usando openapi-spec-validator

```bash
pip install openapi-spec-validator
openapi-spec-validator openapi.json
```

### Usando Spectral (Lint)

```bash
npm install -g @stoplight/spectral-cli
spectral lint openapi.json
```

---

## Schema Atual (Resumo)

### Info

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Template API",
    "description": "API Routes via Next.js 14 com Supabase",
    "version": "0.1.0"
  }
}
```

### Paths Documentados

| Path          | Methods | Descrição         |
| ------------- | ------- | ----------------- |
| `/api/health` | GET     | Health check      |
| `/api/me`     | GET     | Current user info |
| `/api/config` | GET     | Frontend config   |

### Schemas

```json
{
  "HealthResponse": {
    "type": "object",
    "properties": {
      "status": { "type": "string" },
      "version": { "type": "string" }
    },
    "required": ["status", "version"]
  },
  "UserInfo": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "email": { "type": "string" },
      "name": { "type": "string" },
      "roles": {
        "type": "array",
        "items": { "type": "string" }
      }
    },
    "required": ["id", "email", "name", "roles"]
  }
}
```

---

## Exportar para Postman

1. Acesse `http://localhost:3000/api/openapi.json`
2. Copie o conteúdo
3. No Postman: **Import** → **Raw text** → Cole o JSON
4. A collection será criada automaticamente

---

## Customização

### Adicionar Documentação aos Route Handlers

```typescript
// app/api/resource/route.ts
import { NextResponse } from 'next/server'

/**
 * @swagger
 * /api/resource:
 *   get:
 *     summary: Get Resource
 *     description: Retorna lista de recursos
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Resource not found
 */
export async function GET() {
  // ...
  return NextResponse.json(data)
}
```

### Validação com Zod

```typescript
import { z } from 'zod'

const ResourceCreateSchema = z.object({
  name: z.string().min(1),
  value: z.number().int().nonnegative(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const validated = ResourceCreateSchema.parse(body)
  // ...
}
```

---

## CI/CD: Validação Automática

### GitHub Action

```yaml
# .github/workflows/openapi.yml
name: Validate OpenAPI

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install deps
        run: pnpm install

      - name: Start app
        run: |
          pnpm build
          pnpm start &
          sleep 5

      - name: Download schema
        run: curl http://localhost:3000/api/openapi.json -o openapi.json

      - name: Validate schema
        run: |
          npm install -g @stoplight/spectral-cli
          spectral lint openapi.json
```

---

**Arquivos relacionados:**

- `apps/web/app/api/` - API Route Handlers
- `http://localhost:3000/api/openapi.json` - Schema gerado
