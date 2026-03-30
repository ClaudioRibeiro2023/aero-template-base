# Services

Esta pasta contém **serviços de comunicação com APIs** e outras integrações externas.

## Convenções

- Nome dos arquivos: `[recurso].service.ts` (ex: `users.service.ts`)
- Usar o `apiClient` de `@template/shared` para requisições
- Cada serviço deve agrupar operações de um mesmo domínio

## Exemplo de estrutura

```
services/
├── users.service.ts
├── reports.service.ts
└── index.ts          # barrel export
```

## Exemplo de serviço

```typescript
// users.service.ts
import { apiClient } from '@template/shared'

export interface User {
  id: string
  name: string
  email: string
}

export const usersService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users')
    return response.data
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`)
    return response.data
  },

  async create(data: Omit<User, 'id'>): Promise<User> {
    const response = await apiClient.post<User>('/users', data)
    return response.data
  },
}
```

## API Client

O cliente de API está disponível em `@template/shared`:

```typescript
import { apiClient } from '@template/shared'

// GET
const { data } = await apiClient.get('/endpoint')

// POST
const { data } = await apiClient.post('/endpoint', body)

// PUT
const { data } = await apiClient.put('/endpoint', body)

// DELETE
const { data } = await apiClient.delete('/endpoint')
```
