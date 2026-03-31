---
sidebar_position: 1
title: Criando um Novo Módulo
---

# Criando um Novo Módulo

A plataforma inclui um **CLI scaffolding** que gera todo o boilerplate para um módulo frontend.

## Uso

```bash
# Frontend
pnpm create-module products

# Preview sem criar arquivos
pnpm create-module products --dry-run
```

## O que é gerado

### Frontend

```
apps/web/src/
├── components/pages/ProductsPage.tsx    # Página principal
├── types/products.ts                    # TypeScript types
├── hooks/useProducts.ts                 # TanStack Query hooks (CRUD)
├── services/products.ts                 # API client (axios)
└── components/products/                 # Componentes específicos
    └── ProductsList.tsx
```

## Após Criar

1. **Frontend**: Adicione a rota em `App.tsx`:

   ```tsx
   import ProductsPage from '@/components/pages/ProductsPage'
   ;<Route path="/products" element={<ProductsPage />} />
   ```

2. **Crie os types** TypeScript em `types/products.ts`

3. **Escreva testes** para os hooks e componentes
