import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApiClient, type ApiClientConfig } from '../client'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock Supabase client
vi.mock('../../supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token-123',
          },
        },
      }),
    },
  },
}))

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createApiClient', () => {
    it('should create client with default config', () => {
      const client = createApiClient()
      expect(client).toHaveProperty('get')
      expect(client).toHaveProperty('post')
      expect(client).toHaveProperty('put')
      expect(client).toHaveProperty('patch')
      expect(client).toHaveProperty('delete')
    })

    it('should create client with custom config', () => {
      const config: Partial<ApiClientConfig> = {
        baseURL: 'https://custom-api.com',
        timeout: 5000,
      }
      const client = createApiClient(config)
      expect(client).toBeDefined()
    })
  })

  describe('GET requests', () => {
    it('should make GET request with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1, name: 'Test' }),
      })

      const client = createApiClient({ baseURL: 'https://api.test.com' })
      const response = await client.get('/users/1')

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/users/1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(response.data).toEqual({ id: 1, name: 'Test' })
      expect(response.status).toBe(200)
    })

    it('should append query params to URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      })

      const client = createApiClient({ baseURL: 'https://api.test.com' })
      await client.get('/users', { page: '1', limit: '10' })

      const calledUrl = mockFetch.mock.calls[0][0]
      expect(calledUrl).toContain('page=1')
      expect(calledUrl).toContain('limit=10')
    })

    it('should include Authorization header with token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      })

      const client = createApiClient({ baseURL: 'https://api.test.com' })
      await client.get('/protected')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token-123',
          }),
        })
      )
    })
  })

  describe('POST requests', () => {
    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 1 }),
      })

      const client = createApiClient({ baseURL: 'https://api.test.com' })
      const body = { name: 'New User', email: 'user@test.com' }
      const response = await client.post('/users', body)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      )
      expect(response.status).toBe(201)
    })
  })

  describe('PUT requests', () => {
    it('should make PUT request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1, name: 'Updated' }),
      })

      const client = createApiClient({ baseURL: 'https://api.test.com' })
      await client.put('/users/1', { name: 'Updated' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/users/1',
        expect.objectContaining({
          method: 'PUT',
        })
      )
    })
  })

  describe('PATCH requests', () => {
    it('should make PATCH request with partial body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1 }),
      })

      const client = createApiClient({ baseURL: 'https://api.test.com' })
      await client.patch('/users/1', { status: 'active' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/users/1',
        expect.objectContaining({
          method: 'PATCH',
        })
      )
    })
  })

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
      })

      const client = createApiClient({ baseURL: 'https://api.test.com' })
      await client.delete('/users/1')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/users/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('Error handling', () => {
    it('should return error message on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'User not found' }),
      })

      const client = createApiClient({ baseURL: 'https://api.test.com' })
      const response = await client.get('/users/999')

      expect(response.status).toBe(404)
      expect(response.message).toBe('User not found')
    })

    it('should use statusText if no message in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400, // Use 400 (not retryable) instead of 500 (retryable)
        statusText: 'Bad Request',
        json: () => Promise.resolve({}),
      })

      // Disable retries for this test
      const client = createApiClient({ baseURL: 'https://api.test.com', maxRetries: 0 })
      const response = await client.get('/error')

      expect(response.status).toBe(400)
      expect(response.message).toBe('Bad Request')
    })

    it('should throw on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const client = createApiClient({ baseURL: 'https://api.test.com' })

      await expect(client.get('/users')).rejects.toThrow('Network error')
    })
  })
})
