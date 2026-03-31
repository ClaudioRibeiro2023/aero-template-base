# Troubleshooting

Guia de resolução de problemas comuns no Template Platform.

## Índice

- [Ambiente de Desenvolvimento](#ambiente-de-desenvolvimento)
- [Build e Deploy](#build-e-deploy)
- [Autenticação (Supabase Auth)](#autenticação-supabase-auth)
- [API e Server Actions](#api-e-server-actions)
- [Docker e Infraestrutura](#docker-e-infraestrutura)

---

## Ambiente de Desenvolvimento

### `pnpm install` falha com erro de permissão

**Sintoma:** Erro de permissão ao instalar dependências.

**Solução:**

```bash
# Windows (Admin PowerShell)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Linux/Mac
sudo chown -R $(whoami) ~/.pnpm-store
```

---

### TypeScript não reconhece imports de `@template/*`

**Sintoma:** Erro "Cannot find module '@template/shared'"

**Soluções:**

1. Verifique se os packages foram buildados:

   ```bash
   pnpm build:packages
   ```

2. Reinicie o TypeScript Server no VS Code:
   - `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

3. Verifique `tsconfig.json` tem os paths corretos:
   ```json
   "paths": {
     "@template/*": ["./packages/*/src"]
   }
   ```

---

### Hot reload não funciona

**Sintoma:** Alterações não refletem automaticamente.

**Soluções:**

1. Verifique se o dev server está rodando:

   ```bash
   pnpm dev
   ```

2. Limpe o cache do Next.js:

   ```bash
   rm -rf .next
   pnpm dev
   ```

3. Verifique se o arquivo está sendo importado corretamente.

---

## Build e Deploy

### Build falha com "out of memory"

**Sintoma:** `FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed`

**Solução:**

```bash
# Aumentar memória do Node
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

---

### Build falha com erros de tipo

**Sintoma:** TypeScript errors durante o build.

**Soluções:**

1. Execute typecheck primeiro:

   ```bash
   pnpm typecheck
   ```

2. Corrija os erros indicados.

3. Se usar `// @ts-ignore`, considere resolver o erro real.

---

### Assets não carregam em produção

**Sintoma:** Imagens/fonts 404 em produção.

**Soluções:**

1. Verifique se assets estão em `public/` ou importados via `next/image`.

2. Verifique `next.config.mjs` para configurações de imagens externas:
   ```ts
   images: {
     remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }]
   }
   ```

---

## Autenticação (Supabase Auth)

### Login não funciona / redireciona infinitamente

**Sintoma:** Após login, volta para a página de login sem autenticar.

**Soluções:**

1. Verifique as variáveis de ambiente:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Verifique se o middleware está configurado corretamente em `middleware.ts`:

   ```ts
   import { updateSession } from '@/lib/supabase/middleware'
   export async function middleware(request) {
     return await updateSession(request)
   }
   ```

3. Verifique no Supabase Dashboard:
   - Authentication > URL Configuration > Site URL
   - Authentication > URL Configuration > Redirect URLs

---

### Token expira e não renova

**Sintoma:** Sessão expira e usuário é deslogado.

**Soluções:**

1. Verifique se o middleware está fazendo refresh da sessão:

   ```ts
   // lib/supabase/middleware.ts
   const {
     data: { session },
   } = await supabase.auth.getSession()
   ```

2. Verifique configurações de JWT no Supabase Dashboard:
   - Authentication > Settings > JWT expiry: 3600 (1h recomendado)

---

### DEMO_MODE / Auth bypass não funciona

**Sintoma:** Autenticação não é bypassada em modo demo.

**Soluções:**

1. Verifique se a variável está setada:

   ```env
   NEXT_PUBLIC_DEMO_MODE=true
   ```

2. Reinicie o dev server após alterar `.env.local`.

---

## API e Server Actions

### Erro 500 nas API Routes

**Sintoma:** API retorna Internal Server Error.

**Soluções:**

1. Verifique logs do Next.js no terminal:

   ```bash
   pnpm dev
   # Logs aparecem no terminal
   ```

2. Verifique conexão com Supabase (URL e anon key corretos).

3. Verifique se as variáveis de ambiente do servidor estão definidas.

---

### CORS error no browser

**Sintoma:** "Access-Control-Allow-Origin" error.

**Soluções:**

1. Next.js API Routes não precisam de CORS config manual para same-origin.

2. Para cross-origin, configure headers no route handler:

   ```ts
   export async function GET(request: Request) {
     return NextResponse.json(data, {
       headers: {
         'Access-Control-Allow-Origin': 'https://your-domain.com',
       },
     })
   }
   ```

3. Verifique se o Supabase project tem a URL do site configurada corretamente.

---

### Timeout em requisições

**Sintoma:** Requests demoram e falham.

**Soluções:**

1. Verifique se o Supabase project está ativo (não pausado).

2. Para queries pesadas, aumente o timeout:

   ```ts
   const supabase = createClient(url, key, {
     db: { schema: 'public' },
     global: {
       fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(30000) }),
     },
   })
   ```

3. Verifique conexão de rede/VPN.

---

## Docker e Infraestrutura

### Container não inicia

**Sintoma:** `docker-compose up` falha.

**Soluções:**

1. Verifique logs:

   ```bash
   docker-compose logs <service-name>
   ```

2. Verifique se as portas estão livres:

   ```bash
   # Windows
   netstat -ano | findstr :3000
   # Linux/Mac
   lsof -i :3000
   ```

3. Remova volumes e recrie:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

---

### Supabase local não conecta

**Sintoma:** Supabase CLI não inicia ou database não conecta.

**Soluções:**

1. Verifique se o Docker está rodando.

2. Reinicie o Supabase local:

   ```bash
   supabase stop
   supabase start
   ```

3. Verifique as portas padrão:
   - API: 54321
   - DB: 54322
   - Studio: 54323

---

### Banco de dados não conecta

**Sintoma:** "Connection refused" para PostgreSQL.

**Soluções:**

1. Se usando Supabase local:

   ```bash
   supabase status
   ```

2. Se usando Supabase Cloud, verifique se o projeto não está pausado.

3. Teste conexão manual:
   ```bash
   psql "postgresql://postgres:postgres@localhost:54322/postgres"
   ```

---

## Ainda com problemas?

1. Pesquise nas [issues do repositório](https://github.com/ClaudioRibeiro2023/Modelo/issues)
2. Consulte o [portal de documentação](./INDEX.md)
3. Abra uma nova issue com:
   - Descrição do problema
   - Passos para reproduzir
   - Logs relevantes
   - Ambiente (OS, versões)
