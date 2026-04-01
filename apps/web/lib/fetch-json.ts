/**
 * Typed fetch wrapper for API calls.
 * Unwraps { data, error } envelope from API responses.
 */
export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  const json = (await res.json()) as { data?: T; error?: { message?: string } }
  if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`)
  return (json.data ?? json) as T
}

/**
 * Fetch wrapper that returns the full response body without unwrapping.
 * Use for APIs that return { data, meta } envelopes where meta is needed.
 */
export async function fetchJsonRaw<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  const json = (await res.json()) as T & { error?: { message?: string } }
  if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`)
  return json
}
