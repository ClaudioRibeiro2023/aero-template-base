/**
 * Base API client for Template Platform.
 * Uses native fetch with interceptors for auth, errors, and logging.
 */

const API_PREFIX = '/api'

// ============================================================================
// Custom Error Class
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ============================================================================
// Auth helper
// ============================================================================

async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  try {
    const { supabase } = await import('@template/shared/supabase')
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token ?? null
  } catch {
    return null
  }
}

// ============================================================================
// Base request function
// ============================================================================

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  timeout?: number
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { body, timeout = 15000, headers: customHeaders, ...rest } = options

  const token = await getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Request-ID': crypto.randomUUID(),
    ...((customHeaders as Record<string, string>) || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${API_PREFIX}${url}`, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)

      // 401 - Token expired, redirect to login
      if (response.status === 401 && typeof window !== 'undefined') {
        try {
          const { supabase } = await import('@template/shared/supabase')
          await supabase.auth.signOut()
        } catch {
          /* ignore */
        }
        window.location.href = '/login'
      }

      const message =
        data?.detail || data?.message || `HTTP ${response.status}: ${response.statusText}`
      throw new ApiError(message, response.status, data)
    }

    // 204 No Content
    if (response.status === 204) return undefined as T

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408)
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network error', 0)
  } finally {
    clearTimeout(timeoutId)
  }
}

// ============================================================================
// Generic CRUD helpers
// ============================================================================

export async function get<T>(url: string): Promise<T> {
  return request<T>(url, { method: 'GET' })
}

export async function post<T>(url: string, body?: unknown): Promise<T> {
  return request<T>(url, { method: 'POST', body })
}

export async function put<T>(url: string, body?: unknown): Promise<T> {
  return request<T>(url, { method: 'PUT', body })
}

export async function patch<T>(url: string, body?: unknown): Promise<T> {
  return request<T>(url, { method: 'PATCH', body })
}

export async function del(url: string): Promise<void> {
  await request<void>(url, { method: 'DELETE' })
}
