import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const publicPaths = ['/login', '/auth/callback', '/api/health']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and API routes
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Demo mode: skip auth (dev/testing only)
  if (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return NextResponse.next()
  }

  // Check for Supabase session via cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseKey) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    return NextResponse.redirect(new URL('/login?error=config_missing', request.url))
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Try to get session from auth header or cookie
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
    } = await supabase.auth.getUser(token)
    if (user) return NextResponse.next()
  }

  // Try to get session from Supabase cookie
  const cookieHeader = request.headers.get('cookie') || ''
  const sbAccessToken = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('sb-') && c.includes('-auth-token'))

  if (sbAccessToken) {
    const tokenValue = sbAccessToken.split('=').slice(1).join('=')
    try {
      const parsed = JSON.parse(decodeURIComponent(tokenValue))
      const accessToken = typeof parsed === 'string' ? parsed : parsed?.[0]
      if (accessToken) {
        const {
          data: { user },
        } = await supabase.auth.getUser(accessToken)
        if (user) return NextResponse.next()
      }
    } catch {
      // Invalid cookie format, continue to redirect
    }
  }

  // No valid session — redirect to login
  if (!pathname.startsWith('/api/')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
