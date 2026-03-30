# Hooks

Esta pasta contém **hooks React customizados** específicos da aplicação web.

## Convenções

- Nome dos arquivos: `use[Nome].ts` (ex: `useDebounce.ts`, `useLocalStorage.ts`)
- Cada hook deve ter um único propósito
- Hooks compartilhados entre projetos devem ir para `@template/shared`

## Exemplo de estrutura

```
hooks/
├── useDebounce.ts
├── useLocalStorage.ts
├── useMediaQuery.ts
└── index.ts          # barrel export
```

## Exemplo de hook

```typescript
// useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
```

## Hooks disponíveis em @template/shared

- `useAuth()` - Contexto de autenticação
