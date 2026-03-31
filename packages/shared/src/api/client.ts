import { supabase } from '../supabase/client'

export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  /** Number of retry attempts for failed requests */
  maxRetries?: number
  /** Initial delay in ms before first retry */
  retryDelay?: number
  /** Status codes that should trigger a retry */
  retryStatusCodes?: number[]
  /** Interceptors for request/response logging */
  interceptors?: Interceptors
}

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export interface RequestOptions {
  body?: unknown
  params?: Record<string, string>
  headers?: Record<string, string>
  /** Override timeout for this request (ms) */
  timeout?: number
  /** Override max retries for this request */
  maxRetries?: number
}

/**
 * Interceptor types for request/response logging and transformation
 */
export type RequestInterceptor = (config: {
  method: string
  url: string
  headers: Record<string, string>
  body?: unknown
}) => void | Promise<void>

export type ResponseInterceptor = (response: {
  method: string
  url: string
  status: number
  data: unknown
  durationMs: number
}) => void | Promise<void>

export type ErrorInterceptor = (error: {
  method: string
  url: string
  error: Error
  durationMs: number
}) => void | Promise<void>

export interface Interceptors {
  request?: RequestInterceptor[]
  response?: ResponseInterceptor[]
  error?: ErrorInterceptor[]
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelay: number,
  shouldRetry: (error: unknown) => boolean
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error
      }

      const delay = initialDelay * Math.pow(2, attempt)
      console.warn(
        `[API] Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`
      )
      await sleep(delay)
    }
  }

  throw lastError
}

const DEFAULT_BASE_URL =
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || '/api'
const DEFAULT_RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504]

export function createApiClient(config?: Partial<ApiClientConfig>) {
  const baseURL = config?.baseURL || DEFAULT_BASE_URL
  const defaultTimeout = config?.timeout || 30000
  const defaultMaxRetries = config?.maxRetries ?? 3
  const retryDelay = config?.retryDelay || 1000
  const retryStatusCodes = config?.retryStatusCodes || DEFAULT_RETRY_STATUS_CODES
  const interceptors = config?.interceptors || {}

  async function runRequestInterceptors(config: Parameters<RequestInterceptor>[0]) {
    for (const interceptor of interceptors.request || []) {
      await interceptor(config)
    }
  }

  async function runResponseInterceptors(response: Parameters<ResponseInterceptor>[0]) {
    for (const interceptor of interceptors.response || []) {
      await interceptor(response)
    }
  }

  async function runErrorInterceptors(error: Parameters<ErrorInterceptor>[0]) {
    for (const interceptor of interceptors.error || []) {
      await interceptor(error)
    }
  }

  async function getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` }
      }
    } catch (error) {
      console.error('[API] Failed to get auth token:', error)
    }

    return {}
  }

  async function request<T>(
    method: string,
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = new URL(path, baseURL)
    const timeout = options?.timeout ?? defaultTimeout
    const maxRetries = options?.maxRetries ?? defaultMaxRetries

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const authHeaders = await getAuthHeaders()
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options?.headers,
    }

    const makeRequest = async (): Promise<ApiResponse<T>> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      const startTime = performance.now()

      // Run request interceptors
      await runRequestInterceptors({
        method,
        url: url.toString(),
        headers: requestHeaders,
        body: options?.body,
      })

      try {
        const response = await fetch(url.toString(), {
          method,
          headers: requestHeaders,
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        const durationMs = performance.now() - startTime

        const data = await response.json()

        // Run response interceptors
        await runResponseInterceptors({
          method,
          url: url.toString(),
          status: response.status,
          data,
          durationMs,
        })

        // Throw error for retryable status codes
        if (retryStatusCodes.includes(response.status)) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
          ;(error as Error & { status: number }).status = response.status
          throw error
        }

        return {
          data,
          status: response.status,
          message: response.ok ? undefined : data.message || response.statusText,
        }
      } catch (error) {
        clearTimeout(timeoutId)
        const durationMs = performance.now() - startTime

        // Run error interceptors
        await runErrorInterceptors({
          method,
          url: url.toString(),
          error: error instanceof Error ? error : new Error(String(error)),
          durationMs,
        })

        throw error
      }
    }

    // Use retry for GET requests only (safe to retry)
    if (method === 'GET' && maxRetries > 0) {
      return retryWithBackoff(makeRequest, maxRetries, retryDelay, error => {
        // Retry on network errors or retryable status codes
        if (error instanceof Error && 'status' in error) {
          return retryStatusCodes.includes((error as Error & { status: number }).status)
        }
        // Retry on network errors (no status)
        return error instanceof TypeError || (error as Error)?.name === 'AbortError'
      })
    }

    return makeRequest()
  }

  return {
    get: <T>(
      path: string,
      params?: Record<string, string>,
      options?: Omit<RequestOptions, 'params' | 'body'>
    ) => request<T>('GET', path, { ...options, params }),

    post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>('POST', path, { ...options, body }),

    put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>('PUT', path, { ...options, body }),

    patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
      request<T>('PATCH', path, { ...options, body }),

    delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
  }
}

// Default API client instance
export const apiClient = createApiClient()
