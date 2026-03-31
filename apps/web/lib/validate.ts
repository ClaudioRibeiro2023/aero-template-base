import { z, type ZodSchema } from 'zod'
import { badRequest } from './api-response'
import type { NextResponse } from 'next/server'

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const json = await request.json()
    const result = schema.safeParse(json)
    if (!result.success) {
      return { data: null, error: badRequest('Validation error', result.error.flatten()) }
    }
    return { data: result.data, error: null }
  } catch {
    return { data: null, error: badRequest('Invalid JSON') }
  }
}

export { z }
