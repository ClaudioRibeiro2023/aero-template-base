/**
 * Test setup — mock SupabaseDbClient para testes de agent tools.
 *
 * Cada arquivo de teste importa este setup e configura os resultados
 * esperados antes de chamar a tool via setTableResult().
 */
import { vi } from 'vitest'

// Resultado configurável por tabela
const tableResults: Record<string, { data: unknown; error: unknown; count?: number | null }> = {}

// Chainable query builder que resolve para o resultado configurado
function createChain(result: { data: unknown; error: unknown; count?: number | null }) {
  const chain: Record<string, unknown> = {}
  const methods = [
    'select',
    'eq',
    'neq',
    'not',
    'or',
    'in',
    'ilike',
    'gte',
    'lte',
    'gt',
    'lt',
    'order',
    'limit',
    'range',
    'insert',
    'update',
    'delete',
    'upsert',
  ]

  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain)
  }

  // Terminal methods
  chain.maybeSingle = vi.fn().mockResolvedValue(result)
  chain.single = vi.fn().mockResolvedValue(result)

  // Make the chain itself thenable (for `await query` without .single())
  Object.defineProperty(chain, 'then', {
    value: (resolve: (v: typeof result) => void, reject?: (e: unknown) => void) =>
      Promise.resolve(result).then(resolve, reject),
    writable: true,
    configurable: true,
    enumerable: false,
  })

  return chain
}

export const mockClient = {
  from: vi.fn((table: string) => {
    const result = tableResults[table] ?? { data: [], error: null, count: 0 }
    return createChain(result)
  }),
  rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
}

/** Configurar resultado que será retornado ao consultar uma tabela */
export function setTableResult(
  table: string,
  data: unknown,
  error: unknown = null,
  count: number | null = null
) {
  tableResults[table] = { data, error, count }
}

/** Limpar todos os resultados configurados */
export function resetTableResults() {
  for (const key of Object.keys(tableResults)) {
    delete tableResults[key]
  }
  mockClient.from.mockClear()
  mockClient.rpc.mockClear()
}

// Mock do módulo SupabaseDbClient — hoisted pelo vitest
vi.mock('@template/data/supabase', () => ({
  SupabaseDbClient: vi.fn().mockImplementation(() => ({
    asUser: vi.fn().mockResolvedValue(mockClient),
    asAdmin: vi.fn().mockReturnValue(mockClient),
  })),
}))
