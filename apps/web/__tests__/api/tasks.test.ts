/**
 * Testes da API route /api/tasks (GET + POST).
 * v3.0: Mockam @/lib/data (getAuthGateway, getRepository) em vez de supabase-cookies.
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

// ── Mock rate-limit ──
const mockRateLimit = vi.fn(() => ({ success: true, remaining: 99 }))
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: (...args: unknown[]) => mockRateLimit(...args),
  getClientIp: vi.fn(() => '127.0.0.1'),
}))

// ── Mock @/lib/data (v3.0) ──
const mockGetUser = vi.fn()
const mockFindMany = vi.fn()
const mockCreate = vi.fn()

vi.mock('@/lib/data', () => ({
  getAuthGateway: vi.fn(() => ({ getUser: mockGetUser })),
  getRepository: vi.fn(() => ({
    findMany: mockFindMany,
    create: mockCreate,
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  })),
}))

// ── Mock logger ──
vi.mock('@/lib/logger', () => ({
  withApiLog: (_name: string, handler: unknown) => handler,
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

describe('GET /api/tasks', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
    mockGetUser.mockReset()
    mockFindMany.mockReset()
  })

  it('retorna 401 quando usuario nao esta autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ user: null, error: 'Não autenticado' })
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
    mockGetUser.mockResolvedValueOnce({
      user: { id: 'user-123', email: 'user@test.com', role: 'COLABORADOR' },
      error: null,
    })
    const tasks = [
      {
        id: 't1',
        title: 'Task teste',
        status: 'todo',
        priority: 'medium',
        created_by: 'user-123',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
    ]
    mockFindMany.mockResolvedValueOnce(tasks)

    const { GET } = await import('../../app/api/tasks/route')
    const req = makeRequest({ url: 'http://localhost:3000/api/tasks' })
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('filtra por status quando parametro fornecido', async () => {
    mockGetUser.mockResolvedValueOnce({
      user: { id: 'user-123', email: 'user@test.com', role: 'COLABORADOR' },
      error: null,
    })
    mockFindMany.mockResolvedValueOnce([])

    const { GET } = await import('../../app/api/tasks/route')
    const req = makeRequest({ url: 'http://localhost:3000/api/tasks?status=done' })
    const res = await GET(req)
    expect(res.status).toBe(200)
    // Verifica que findMany foi chamado com filtro de status
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.arrayContaining([
          expect.objectContaining({ field: 'status', value: 'done' }),
        ]),
      })
    )
  })
})

describe('POST /api/tasks', () => {
  beforeEach(() => {
    vi.resetModules()
    mockRateLimit.mockReturnValue({ success: true, remaining: 99 })
    mockGetUser.mockReset()
    mockCreate.mockReset()
  })

  it('retorna 401 quando usuario nao esta autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ user: null, error: 'Não autenticado' })
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
    mockGetUser.mockResolvedValueOnce({
      user: { id: 'user-123', email: 'user@test.com', role: 'COLABORADOR' },
      error: null,
    })
    const createdTask = {
      id: 'new-task',
      title: 'Nova Task',
      status: 'todo',
      priority: 'medium',
      created_by: 'user-123',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    mockCreate.mockResolvedValueOnce(createdTask)

    const { POST } = await import('../../app/api/tasks/route')
    const req = makeRequest({
      method: 'POST',
      body: { title: 'Nova Task', status: 'todo', priority: 'medium' },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })
})
