/**
 * Testes da API route /api/tasks (GET + POST).
 * Mockam: rate-limit, supabase-cookies, next/server.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock next/server ──
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}))

// ── Mock rate-limit: sempre permite por padrão ──
const mockRateLimit = vi.fn(() => ({ success: true, remaining: 99 }))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

// ── Mock supabase-cookies ──
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
vi.mock('@/lib/supabase-cookies', () => ({
  createSupabaseCookieClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

// ── Mock @template/shared/schemas ──
vi.mock('@template/shared/schemas', () => ({
  taskCreateSchema: {
    safeParse: vi.fn((data: unknown) => ({ success: true, data })),
  },
}))

// ── Helper: cria NextRequest simulado ──
function makeRequest(options: {
  method?: string
  url?: string
  body?: unknown
  headers?: Record<string, string>
}) {
  const { method = 'GET', url = 'http://localhost:3000/api/tasks', body, headers = {} } = options
  const defaultHeaders: Record<string, string> = { 'x-forwarded-for': '127.0.0.1' }
  if (method !== 'GET' && method !== 'DELETE') defaultHeaders['content-type'] = 'application/json'
  return {
    method,
    url,
    headers: new Map(Object.entries({ ...defaultHeaders, ...headers })),
    json: vi.fn(async () => body),
  } as unknown as import('next/server').NextRequest
}

// ── Helper: chain de supabase query ──
function makeQueryChain(result: { data?: unknown; error?: unknown; count?: number }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    then: undefined as unknown,
  }
  // Para o GET que retorna promise diretamente (sem .single())
  const promise = Promise.resolve(result)
  Object.assign(chain, promise)
  return chain
}

describe('GET /api/tasks', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
  })

  it('retorna 401 quando usuario nao esta autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { GET } = await import('../../app/api/tasks/route')
    const req = makeRequest({ url: 'http://localhost:3000/api/tasks' })
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('retorna 429 quando rate limit excedido', async () => {
    mockRateLimit.mockReturnValueOnce({ success: false, remaining: 0 })
    const { GET } = await import('../../app/api/tasks/route')
    const req = makeRequest({ url: 'http://localhost:3000/api/tasks' })
    const res = await GET(req)
    expect(res.status).toBe(429)
  })

  it('retorna lista de tasks com sucesso para usuario autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })

    const tasks = [
      {
        id: 't1',
        title: 'Task teste',
        status: 'todo',
        priority: 'medium',
        description: null,
        assignee_id: null,
        created_by: 'user-123',
        tenant_id: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]

    const chain = makeQueryChain({ data: tasks, error: null, count: 1 })
    mockFrom.mockReturnValue(chain)

    const { GET } = await import('../../app/api/tasks/route')
    const req = makeRequest({ url: 'http://localhost:3000/api/tasks' })
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('filtra por status quando parametro fornecido', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })
    const chain = makeQueryChain({ data: [], error: null, count: 0 })
    mockFrom.mockReturnValue(chain)

    const { GET } = await import('../../app/api/tasks/route')
    const req = makeRequest({ url: 'http://localhost:3000/api/tasks?status=done' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    // .eq deve ter sido chamado com 'status', 'done'
    expect(chain.eq).toHaveBeenCalledWith('status', 'done')
  })
})

describe('POST /api/tasks', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
  })

  it('retorna 401 quando usuario nao esta autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    const { POST } = await import('../../app/api/tasks/route')
    const req = makeRequest({
      method: 'POST',
      body: { title: 'Nova', status: 'todo', priority: 'medium' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('retorna 429 quando rate limit excedido', async () => {
    mockRateLimit.mockReturnValueOnce({ success: false, remaining: 0 })
    const { POST } = await import('../../app/api/tasks/route')
    const req = makeRequest({ method: 'POST', body: {} })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('cria task com sucesso e retorna 201', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })

    const createdTask = {
      id: 'new-task',
      title: 'Nova Task',
      status: 'todo',
      priority: 'medium',
      description: null,
      assignee_id: null,
      created_by: 'user-123',
      tenant_id: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }

    const chain = makeQueryChain({ data: createdTask, error: null })
    mockFrom.mockReturnValue(chain)

    const { POST } = await import('../../app/api/tasks/route')
    const req = makeRequest({
      method: 'POST',
      body: { title: 'Nova Task', status: 'todo', priority: 'medium' },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })
})
