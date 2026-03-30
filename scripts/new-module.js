#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires, no-console */
/**
 * create-template-module — Sprint 32
 *
 * Scaffolds a full-stack module with FE (React page + hooks + service + types)
 * and BE (FastAPI router + service + test) files.
 *
 * Usage:
 *   node scripts/new-module.js <name>              # full-stack (FE + BE)
 *   node scripts/new-module.js <name> --fe-only    # frontend only
 *   node scripts/new-module.js <name> --be-only    # backend only
 *   node scripts/new-module.js <name> --dry-run    # preview without writing
 *
 * Examples:
 *   node scripts/new-module.js invoices
 *   node scripts/new-module.js project-management --be-only
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

// ============================================================================
// Paths
// ============================================================================
const ROOT = path.join(__dirname, '..')
const FE_MODULES_PATH = path.join(ROOT, 'apps/web/src/modules')
const BE_APP_PATH = path.join(ROOT, 'api-template/app')
const BE_ROUTERS_PATH = path.join(BE_APP_PATH, 'routers')
const BE_TESTS_PATH = path.join(ROOT, 'api-template/tests')

// ============================================================================
// String helpers (exported for testing)
// ============================================================================
function toPascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

function toCamelCase(str) {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

// ============================================================================
// FE Templates
// ============================================================================
const feTemplates = {
  'types.ts': (mod, pascal) => `/**
 * Tipos do módulo ${pascal}
 */

export interface ${pascal}Item {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface ${pascal}Filters {
  search?: string
  page?: number
  limit?: number
}

export interface ${pascal}State {
  items: ${pascal}Item[]
  isLoading: boolean
  error: string | null
}
`,

  'index.ts': (_mod, pascal) => `// ${pascal} Module exports
export { default as ${pascal}Page } from './${pascal}Page'
export * from './types'
export * from './components'
export * from './hooks'
`,

  'Page.tsx': (_mod, pascal) => `import { useState } from 'react'
import { useAuth } from '@template/shared'
import { useTranslation } from 'react-i18next'

export default function ${pascal}Page() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">${pascal}</h1>
        <p className="text-text-secondary">
          {t('app.loading')}
        </p>
      </header>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <input
            type="text"
            placeholder={t('app.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            aria-label={t('app.search')}
          />
        </div>

        <div className="text-center text-text-secondary">
          <p>Implemente a listagem aqui</p>
          <p className="text-sm mt-2">
            Usuário: {user?.name || 'Não autenticado'}
          </p>
        </div>
      </section>
    </div>
  )
}
`,

  'components/index.ts': (_mod, pascal) => `// ${pascal} Components
// export { ${pascal}Card } from './${pascal}Card'
`,

  'hooks/index.ts': (_mod, pascal, camel) => `// ${pascal} Hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ${pascal}Item, ${pascal}Filters } from '../types'

const QUERY_KEY = '${camel}'

export function use${pascal}List(filters?: ${pascal}Filters) {
  return useQuery<${pascal}Item[]>({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      // TODO: replace with real API call
      return []
    },
  })
}

export function use${pascal}Create() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<${pascal}Item>) => {
      // TODO: replace with real API call
      return data as ${pascal}Item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
`,

  'services/index.ts': (mod, pascal) => `// ${pascal} Service
import { api } from '../../../services/api'
import type { ${pascal}Item, ${pascal}Filters } from '../types'

const BASE = '/api/${mod}'

export const ${mod}Service = {
  list: (filters?: ${pascal}Filters) =>
    api.get<${pascal}Item[]>(BASE, { params: filters }).then(r => r.data),

  getById: (id: string) =>
    api.get<${pascal}Item>(\`\${BASE}/\${id}\`).then(r => r.data),

  create: (data: Partial<${pascal}Item>) =>
    api.post<${pascal}Item>(BASE, data).then(r => r.data),

  update: (id: string, data: Partial<${pascal}Item>) =>
    api.patch<${pascal}Item>(\`\${BASE}/\${id}\`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(\`\${BASE}/\${id}\`).then(r => r.data),
}
`,
}

// ============================================================================
// BE Templates (FastAPI)
// ============================================================================
const beTemplates = {
  'router': (snake, pascal) => `"""
Router for ${pascal} module.
Auto-generated by create-template-module.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from ..auth import require_roles

router = APIRouter(prefix="/api/${snake.replace(/_/g, '-')}", tags=["${snake}"])


# ============================================================================
# Schemas
# ============================================================================

class ${pascal}Create(BaseModel):
    name: str
    description: Optional[str] = None

class ${pascal}Update(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class ${pascal}Response(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: str
    updated_at: str

class ${pascal}ListResponse(BaseModel):
    items: list[${pascal}Response]
    total: int


# ============================================================================
# In-memory store (replace with DB in production)
# ============================================================================

_store: dict[str, dict] = {}


# ============================================================================
# Endpoints
# ============================================================================

@router.get("", response_model=${pascal}ListResponse)
async def list_${snake}(search: Optional[str] = None, page: int = 1, limit: int = 20):
    """List all ${snake} items."""
    items = list(_store.values())
    if search:
        items = [i for i in items if search.lower() in i["name"].lower()]
    total = len(items)
    start = (page - 1) * limit
    items = items[start : start + limit]
    return ${pascal}ListResponse(
        items=[${pascal}Response(**i) for i in items],
        total=total,
    )

@router.get("/{item_id}", response_model=${pascal}Response)
async def get_${snake}(item_id: str):
    """Get a single ${snake} item by ID."""
    if item_id not in _store:
        raise HTTPException(status_code=404, detail="${pascal} not found")
    return ${pascal}Response(**_store[item_id])

@router.post("", response_model=${pascal}Response, status_code=status.HTTP_201_CREATED)
async def create_${snake}(data: ${pascal}Create):
    """Create a new ${snake} item."""
    import uuid
    item_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    item = {
        "id": item_id,
        "name": data.name,
        "description": data.description,
        "created_at": now,
        "updated_at": now,
    }
    _store[item_id] = item
    return ${pascal}Response(**item)

@router.patch("/{item_id}", response_model=${pascal}Response)
async def update_${snake}(item_id: str, data: ${pascal}Update):
    """Update an existing ${snake} item."""
    if item_id not in _store:
        raise HTTPException(status_code=404, detail="${pascal} not found")
    item = _store[item_id]
    if data.name is not None:
        item["name"] = data.name
    if data.description is not None:
        item["description"] = data.description
    item["updated_at"] = datetime.utcnow().isoformat()
    return ${pascal}Response(**item)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_${snake}(item_id: str):
    """Delete a ${snake} item."""
    if item_id not in _store:
        raise HTTPException(status_code=404, detail="${pascal} not found")
    del _store[item_id]
`,

  'test': (snake, pascal) => `"""
Tests for ${pascal} router.
Auto-generated by create-template-module.
"""

import pytest
from fastapi.testclient import TestClient


# ============================================================================
# NOTE: To use this test, register the router in main.py first:
#   from .routers.${snake} import router as ${snake}_router
#   app.include_router(${snake}_router)
# Then import the app fixture:
#   from app.main import app
# ============================================================================

# Placeholder test — uncomment and adapt after registering the router.

class Test${pascal}Router:
    """Tests for /api/${snake.replace(/_/g, '-')} endpoints."""

    # @pytest.fixture
    # def client(self):
    #     from app.main import app
    #     return TestClient(app)

    def test_placeholder(self):
        """Remove this once the router is registered in main.py."""
        assert True

    # def test_list_empty(self, client):
    #     resp = client.get("/api/${snake.replace(/_/g, '-')}")
    #     assert resp.status_code == 200
    #     assert resp.json()["items"] == []
    #     assert resp.json()["total"] == 0

    # def test_create(self, client):
    #     resp = client.post("/api/${snake.replace(/_/g, '-')}", json={"name": "Test"})
    #     assert resp.status_code == 201
    #     data = resp.json()
    #     assert data["name"] == "Test"
    #     assert "id" in data

    # def test_get_by_id(self, client):
    #     create = client.post("/api/${snake.replace(/_/g, '-')}", json={"name": "Item1"})
    #     item_id = create.json()["id"]
    #     resp = client.get(f"/api/${snake.replace(/_/g, '-')}/{item_id}")
    #     assert resp.status_code == 200
    #     assert resp.json()["name"] == "Item1"

    # def test_get_not_found(self, client):
    #     resp = client.get("/api/${snake.replace(/_/g, '-')}/nonexistent")
    #     assert resp.status_code == 404

    # def test_update(self, client):
    #     create = client.post("/api/${snake.replace(/_/g, '-')}", json={"name": "Old"})
    #     item_id = create.json()["id"]
    #     resp = client.patch(f"/api/${snake.replace(/_/g, '-')}/{item_id}", json={"name": "New"})
    #     assert resp.status_code == 200
    #     assert resp.json()["name"] == "New"

    # def test_delete(self, client):
    #     create = client.post("/api/${snake.replace(/_/g, '-')}", json={"name": "Del"})
    #     item_id = create.json()["id"]
    #     resp = client.delete(f"/api/${snake.replace(/_/g, '-')}/{item_id}")
    #     assert resp.status_code == 204
`,
}

// ============================================================================
// Prompt helper
// ============================================================================
async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

// ============================================================================
// File creation helpers
// ============================================================================
function writeFile(filePath, content, dryRun) {
  if (dryRun) {
    console.log(`   [dry-run] 📄 ${path.relative(ROOT, filePath)}`)
    return
  }
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, content)
  console.log(`   📄 ${path.relative(ROOT, filePath)}`)
}

function scaffoldFE(moduleName, pascalName, camelName, dryRun) {
  const modulePath = path.join(FE_MODULES_PATH, moduleName)

  if (!dryRun && fs.existsSync(modulePath)) {
    console.error(`   ❌ FE module "${moduleName}" already exists at ${modulePath}`)
    return false
  }

  console.log('\n   📦 Frontend (React)')

  for (const [fileName, templateFn] of Object.entries(feTemplates)) {
    const actualFileName = fileName === 'Page.tsx' ? `${pascalName}Page.tsx` : fileName
    const filePath = path.join(modulePath, actualFileName)
    const content = templateFn(moduleName, pascalName, camelName)
    writeFile(filePath, content, dryRun)
  }

  return true
}

function scaffoldBE(snakeName, pascalName, dryRun) {
  const routerPath = path.join(BE_ROUTERS_PATH, `${snakeName}.py`)
  const testPath = path.join(BE_TESTS_PATH, `test_${snakeName}_router.py`)

  if (!dryRun && fs.existsSync(routerPath)) {
    console.error(`   ❌ BE router "${snakeName}.py" already exists`)
    return false
  }

  console.log('\n   � Backend (FastAPI)')

  writeFile(routerPath, beTemplates.router(snakeName, pascalName), dryRun)
  writeFile(testPath, beTemplates.test(snakeName, pascalName), dryRun)

  return true
}

// ============================================================================
// Main
// ============================================================================
async function main() {
  const args = process.argv.slice(2)
  const flags = args.filter(a => a.startsWith('--'))
  const positional = args.filter(a => !a.startsWith('--'))

  const feOnly = flags.includes('--fe-only')
  const beOnly = flags.includes('--be-only')
  const dryRun = flags.includes('--dry-run')

  console.log('🚀 create-template-module — Template Platform\n')

  // Get module name
  let rawName = positional[0]
  if (!rawName) {
    rawName = await prompt('Nome do módulo (kebab-case): ')
  }
  if (!rawName) {
    console.error('❌ Nome do módulo é obrigatório')
    process.exit(1)
  }

  const kebabName = toKebabCase(rawName)
  const pascalName = toPascalCase(rawName)
  const snakeName = toSnakeCase(rawName)
  const camelName = toCamelCase(rawName)

  console.log(`   Module:     ${kebabName}`)
  console.log(`   PascalCase: ${pascalName}`)
  console.log(`   snake_case: ${snakeName}`)
  console.log(`   camelCase:  ${camelName}`)
  if (dryRun) console.log('   Mode:       DRY RUN (no files written)')
  if (feOnly) console.log('   Scope:      Frontend only')
  if (beOnly) console.log('   Scope:      Backend only')

  let feOk = true
  let beOk = true

  if (!beOnly) feOk = scaffoldFE(kebabName, pascalName, camelName, dryRun)
  if (!feOnly) beOk = scaffoldBE(snakeName, pascalName, dryRun)

  if (!feOk || !beOk) {
    console.error('\n⚠️  Scaffolding parcial — verifique os erros acima.')
    process.exit(1)
  }

  console.log('\n✅ Módulo criado com sucesso!')
  console.log('\n📝 Próximos passos:')

  if (!beOnly) {
    console.log(`   FE 1. Rota em apps/web/src/App.tsx:`)
    console.log(`         const ${pascalName}Page = lazy(() => import('./modules/${kebabName}/${pascalName}Page'))`)
    console.log(`         <Route path="/${kebabName}" element={<${pascalName}Page />} />`)
    console.log(`   FE 2. Adicione ao menu de navegação (opcional)`)
  }

  if (!feOnly) {
    console.log(`   BE 1. Registrar router em api-template/app/main.py:`)
    console.log(`         from .routers.${snakeName} import router as ${snakeName}_router`)
    console.log(`         app.include_router(${snakeName}_router)`)
    console.log(`   BE 2. Descomentar testes em tests/test_${snakeName}_router.py`)
  }

  console.log('')
}

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = { toPascalCase, toSnakeCase, toKebabCase, toCamelCase, feTemplates, beTemplates }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error)
}
