# RBAC - Role-Based Access Control

> Sistema de controle de acesso baseado em roles do Template Platform.

**Fonte:** `packages/shared/src/auth/types.ts`, `docs/ROLES_E_ACESSO.md`

---

## Visão Geral

O Template Platform implementa RBAC (Role-Based Access Control) com integração ao Supabase Auth. As roles são definidas no Supabase e propagadas via JWT.

### Roles Disponíveis

**Fonte:** `packages/shared/src/auth/types.ts:2`

```typescript
export type UserRole = 'ADMIN' | 'GESTOR' | 'OPERADOR' | 'VIEWER'
```

| Role       | Nível | Descrição      | Permissões Típicas                 |
| ---------- | ----- | -------------- | ---------------------------------- |
| `ADMIN`    | 1     | Administrador  | Tudo: config, usuários, dados      |
| `GESTOR`   | 2     | Gestor de área | CRUD em módulos, relatórios        |
| `OPERADOR` | 3     | Operador       | Operações diárias, edição limitada |
| `VIEWER`   | 4     | Visualizador   | Apenas leitura                     |

---

## Configuração no Supabase

### 1. Definir Roles

As roles são armazenadas na tabela `profiles` ou via custom claims no JWT do Supabase Auth.

### 2. Atribuir Roles a Usuários

Atualizar o campo `role` no perfil do usuário via dashboard Supabase ou API.

---

## Uso no Frontend

### AuthContext

**Fonte:** `packages/shared/src/auth/AuthContext.tsx`

```typescript
import { useAuth } from '@template/shared/auth'

function MyComponent() {
  const { user, hasRole, hasAnyRole, isAuthenticated } = useAuth()

  // Usuário atual
  console.log(user?.roles) // ['ADMIN', 'GESTOR']

  // Verificar role única
  if (hasRole('ADMIN')) {
    // Acesso admin
  }

  // Verificar múltiplas (todas necessárias)
  if (hasRole(['ADMIN', 'GESTOR'])) {
    // Precisa ADMIN E GESTOR
  }

  // Verificar qualquer uma
  if (hasAnyRole(['ADMIN', 'GESTOR'])) {
    // ADMIN OU GESTOR
  }
}
```

### Proteção de Rotas

```tsx
// Componente ProtectedRoute
<Route
  path="/admin/config"
  element={
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <ConfigPage />
    </ProtectedRoute>
  }
/>

// Múltiplas roles (qualquer uma)
<ProtectedRoute requiredRoles={['ADMIN', 'GESTOR']}>
  <ManagementPage />
</ProtectedRoute>
```

### Esconder Elementos UI

```tsx
function Sidebar() {
  const { hasRole, hasAnyRole } = useAuth()

  return (
    <nav>
      <Link to="/">Home</Link>

      {hasAnyRole(['ADMIN', 'GESTOR']) && <Link to="/users">Usuários</Link>}

      {hasRole('ADMIN') && <Link to="/config">Configurações</Link>}
    </nav>
  )
}
```

---

## Uso no Backend (Next.js API Routes)

### Middleware de autorização

```typescript
import { createClient } from '@/lib/supabase/server'

export async function requireRole(requiredRoles: string[]) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const userRole = user.user_metadata?.role
  if (!requiredRoles.includes(userRole)) {
    throw new Error('Forbidden')
  }

  return user
}
```

---

## Matriz de Permissões

### Por Módulo

| Módulo                  | ADMIN | GESTOR | OPERADOR | VIEWER |
| ----------------------- | ----- | ------ | -------- | ------ |
| Dashboard               | ✅    | ✅     | ✅       | ✅     |
| Usuários (listar)       | ✅    | ✅     | ✅       | ✅     |
| Usuários (criar/editar) | ✅    | ✅     | ❌       | ❌     |
| Usuários (deletar)      | ✅    | ❌     | ❌       | ❌     |
| Configurações           | ✅    | ❌     | ❌       | ❌     |
| Relatórios              | ✅    | ✅     | ✅       | ✅     |
| ETL (executar)          | ✅    | ✅     | ✅       | ❌     |
| ETL (configurar)        | ✅    | ✅     | ❌       | ❌     |
| Logs de Auditoria       | ✅    | ✅     | ❌       | ❌     |

### Por Ação

| Ação                  | Roles Necessárias |
| --------------------- | ----------------- |
| Visualizar dados      | VIEWER+           |
| Criar registros       | OPERADOR+         |
| Editar registros      | OPERADOR+         |
| Deletar registros     | GESTOR+           |
| Configurar sistema    | ADMIN             |
| Gerenciar usuários    | ADMIN             |
| Exportar dados        | GESTOR+           |
| Ver logs de auditoria | GESTOR+           |

---

## Hierarquia de Roles

### Modelo Atual (Flat)

No código atual, **não há hierarquia automática**. Cada role é independente.

```typescript
// hasRole(['ADMIN']) retorna true APENAS se user tem ADMIN
// Mesmo que tenha GESTOR, OPERADOR, VIEWER
```

### Implementar Hierarquia (Opcional)

Se desejar que ADMIN herde permissões de GESTOR:

```typescript
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  ADMIN: ['ADMIN', 'GESTOR', 'OPERADOR', 'VIEWER'],
  GESTOR: ['GESTOR', 'OPERADOR', 'VIEWER'],
  OPERADOR: ['OPERADOR', 'VIEWER'],
  VIEWER: ['VIEWER'],
}

function hasEffectiveRole(userRoles: UserRole[], requiredRole: UserRole): boolean {
  return userRoles.some(role => ROLE_HIERARCHY[role]?.includes(requiredRole))
}
```

---

## Modo Demo / E2E

### Todas as Roles

No modo demo (`NEXT_PUBLIC_DEMO_MODE=true`), o usuário mock tem todas as roles:

```typescript
const mockUser: AuthUser = {
  id: 'demo-user-001',
  roles: ['ADMIN', 'GESTOR', 'OPERADOR', 'VIEWER'],
}
```

### Testar com Roles Específicas

```bash
# Via query params
http://localhost:13000?e2e-roles=VIEWER

# Via localStorage
localStorage.setItem('e2e-roles', '["OPERADOR"]')
```

---

## Auditoria

Todas as ações de alteração devem incluir o user ID para auditoria, registrado via Supabase database triggers ou logging no server action.

---

## Troubleshooting

### Usuário não tem roles esperadas

1. Verificar roles no dashboard Supabase
2. Inspecionar JWT em jwt.io
3. Verificar user_metadata no Supabase Auth

### 403 mesmo com role correta

1. Verificar case sensitivity (ADMIN vs admin)
2. Verificar se role está no user_metadata
3. Logs do backend para ver roles extraídas

### Roles não aparecem no frontend

1. Verificar se user_metadata contém o campo role
2. Console do browser: `useAuth().user?.roles`

---

**Arquivos relacionados:**

- `packages/shared/src/auth/types.ts`
- `packages/shared/src/auth/AuthContext.tsx`
- `docs/ROLES_E_ACESSO.md`
