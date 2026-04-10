import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicPaths = ['/login', '/register', '/auth/callback', '/api/health']
const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es']

function detectLocale(request: NextRequest): string | null {
  // 1. Cookie (set by user preference)
  const cookieLocale = request.cookies.get('locale')?.value
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return null // already set

  // 2. Accept-Language header
  const acceptLang = request.headers.get('accept-language')
  if (!acceptLang) return null

  for (const part of acceptLang.split(',')) {
    const lang = part.split(';')[0].trim()
    if (SUPPORTED_LOCALES.includes(lang)) return lang
    // Match prefix: 'pt' → 'pt-BR', 'en' → 'en-US', 'es' → 'es'
    const prefix = lang.split('-')[0]
    const match = SUPPORTED_LOCALES.find(l => l.startsWith(prefix))
    if (match) return match
  }

  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Demo mode: skip auth in development only (server-side env, not exposed to client)
  if (process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    return NextResponse.redirect(new URL('/login?error=config_missing', request.url))
  }

  // @supabase/ssr: gerencia cookies automaticamente, incluindo refresh de tokens
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options as never)
        )
      },
    },
  })

  // IMPORTANTE: usar getUser() (validação server-side) — nunca getSession() no middleware
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Auto-detect locale from Accept-Language if no cookie set
  const detectedLocale = detectLocale(request)
  if (detectedLocale) {
    supabaseResponse.cookies.set('locale', detectedLocale, {
      path: '/',
      maxAge: 31536000, // 1 year
      sameSite: 'lax',
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
