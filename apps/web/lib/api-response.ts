import { NextResponse } from 'next/server'

interface ApiMeta {
  page?: number
  page_size?: number
  total?: number
  pages?: number
}

export function ok<T>(data: T, meta?: ApiMeta, status = 200) {
  return NextResponse.json({ data, error: null, meta: meta ?? null }, { status })
}

export function created<T>(data: T) {
  return ok(data, undefined, 201)
}

export function noContent() {
  return new NextResponse(null, { status: 204 })
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json(
    { data: null, error: { message, details: details ?? null } },
    { status: 400 }
  )
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ data: null, error: { message } }, { status: 401 })
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ data: null, error: { message } }, { status: 403 })
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ data: null, error: { message } }, { status: 404 })
}

export function tooManyRequests() {
  return NextResponse.json({ data: null, error: { message: 'Too Many Requests' } }, { status: 429 })
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json({ data: null, error: { message } }, { status: 500 })
}
