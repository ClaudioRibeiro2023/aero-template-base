---
sidebar_position: 4
title: State Management
---

# State Management

## Estratégia

A plataforma usa **TanStack Query v5** como principal ferramenta de gerenciamento de estado servidor. Não há Redux ou Zustand — o padrão é:

- **Server state** → TanStack Query (queries + mutations + cache invalidation)
- **UI state** → React `useState` / `useReducer` local
- **Global state** → React Context (auth, tenant, toast, notifications)

## TanStack Query Config

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
})
```

## Patterns

### Query Hook

```tsx
export function useFileList(params: FileListParams) {
  return useQuery({
    queryKey: ['files', params],
    queryFn: () => fileUploadService.list(params),
  })
}
```

### Mutation com Cache Invalidation

```tsx
export function useFileUpload(options) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: data => fileUploadService.upload(data.file, data.tags, options.onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
      options.onSuccess?.()
    },
  })
}
```

### Contexts Globais

| Context               | Propósito                          |
| --------------------- | ---------------------------------- |
| `AuthContext`         | Estado de autenticação + user info |
| `TenantContext`       | Tenant atual + switcher            |
| `NotificationContext` | WebSocket notifications            |
| `ToastContext`        | Toast messages                     |
