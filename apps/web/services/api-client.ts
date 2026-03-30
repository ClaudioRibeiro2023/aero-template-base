import { env } from '@/lib/env'
/**
 * Base API client for Template Platform.
 * Uses axios with request/response interceptors for auth, errors, and logging.
 */
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const BASE_URL = env.API_URL || 'http://localhost:8000'
const API_PREFIX = '/api/v1'

// ============================================================================
// Axios Instance
// ============================================================================

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}${API_PREFIX}`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ============================================================================
// Request Interceptor - attach auth token
// ============================================================================

apiClient.interceptors.request.use(
  async config => {
    // Attach Bearer token from Supabase session (client-side only)
    if (typeof window !== 'undefined') {
      try {
        const { supabase } = await import('@template/shared/supabase')
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.access_token) {
          config.headers['Authorization'] = `Bearer ${session.access_token}`
        }
      } catch {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`
        }
      }
    }

    // Generate request ID for tracing
    config.headers['X-Request-ID'] = crypto.randomUUID()

    return config
  },
  error => Promise.reject(error)
)

// ============================================================================
// Response Interceptor - normalize errors
// ============================================================================

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response) {
      const { status, data } = error.response

      // 401 - Token expired, redirect to login
      if (status === 401) {
        try {
          const { supabase } = await import('@template/shared/supabase')
          await supabase.auth.signOut()
        } catch {
          /* ignore */
        }
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }

      // Normalize error message
      const message =
        data?.detail || data?.message || `HTTP ${status}: ${error.response.statusText}`

      return Promise.reject(new ApiError(message, status, data))
    }

    if (error.request) {
      return Promise.reject(new ApiError('Network error - no response from server', 0))
    }

    return Promise.reject(new ApiError(error.message || 'Unknown error', -1))
  }
)

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
// Generic CRUD helpers
// ============================================================================

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.get<T>(url, config)
  return data
}

export async function post<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await apiClient.post<T>(url, body, config)
  return data
}

export async function put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await apiClient.put<T>(url, body, config)
  return data
}

export async function del(url: string, config?: AxiosRequestConfig): Promise<void> {
  await apiClient.delete(url, config)
}
