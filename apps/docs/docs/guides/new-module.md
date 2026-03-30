---
sidebar_position: 1
title: Criando um Novo Módulo
---

# Criando um Novo Módulo

A plataforma inclui um **CLI scaffolding** que gera todo o boilerplate para um módulo full-stack.

## Uso

```bash
# Full-stack (FE + BE)
pnpm create-module products

# Apenas frontend
pnpm create-module products --fe-only

# Apenas backend
pnpm create-module products --be-only

# Preview sem criar arquivos
pnpm create-module products --dry-run
```

## O que é gerado

### Frontend (`--fe-only` ou full-stack)

```
apps/web/src/
├── components/pages/ProductsPage.tsx    # Página principal
├── types/products.ts                    # TypeScript types
├── hooks/useProducts.ts                 # TanStack Query hooks (CRUD)
├── services/products.ts                 # API client (axios)
└── components/products/                 # Componentes específicos
    └── ProductsList.tsx
```

### Backend (`--be-only` ou full-stack)

```
api-template/
├── app/routers/products.py              # FastAPI router (CRUD completo)
├── app/schemas/products.py              # Pydantic schemas
└── tests/test_products.py               # Test placeholder
```

## Após Criar

1. **Backend**: Registre o router em `app/main.py`:

   ```python
   from app.routers.products import router as products_router
   app.include_router(products_router)
   ```

2. **Frontend**: Adicione a rota em `App.tsx`:

   ```tsx
   import ProductsPage from '@/components/pages/ProductsPage'
   ;<Route path="/products" element={<ProductsPage />} />
   ```

3. **Crie os models** SQLAlchemy em `app/models/products.py`

4. **Crie a migration**: `cd api-template && python -m alembic revision --autogenerate -m "add_products"`

5. **Escreva testes** para o router e os hooks
