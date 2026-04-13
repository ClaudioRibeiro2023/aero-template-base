/**
 * middleware.ts — Proteção de rotas + locale detection.
 *
 * v3.0: Auth delegado para getServerAuthProvider() (padrão: SupabaseServerAuth).
 * Para trocar o provider de auth, setar AUTH_PROVIDER=nextauth (ou outro).
 * Locale detection é provider-agnostic e permanece aqui.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { getServerAuthProvider } from '@/lib/server-auth-provider'

const publicPaths = ['/login', '/register', '/auth/callback', '/api/health']
const SUPPORTED_LOCALES = ['pt-BR', 'en-US', 'es']

function detectLocale(request: NextRequest): string | null {
  const cookieLocale = request.cookies.get('locale')?.value
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) return null

  const acceptLang = request.headers.get('accept-language')
  if (!acceptLang) return null

  for (const part of acceptLang.split(',')) {
    const lang = part.split(';')[0].trim()
    if (SUPPORTED_LOCALES.includes(lang)) return lang
    const prefix = lang.split('-')[0]
    const match = SUPPORTED_LOCALES.find(l => l.startsWith(prefix))
    if (match) return match
  }
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas — sem validação de auth
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Demo mode: bypass auth em desenvolvimento
  if (process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  // Supabase não configurado — falha segura
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }
    return NextResponse.redirect(new URL('/login?error=config_missing', request.url))
  }

  // Delega validação de auth ao provider configurado
  const { user, response } = await getServerAuthProvider().validateRequest(request)

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // ── Module gating — bloquear rotas de módulos desabilitados ──
  // Import dinâmico lazy para não impactar cold start de rotas públicas
  const { isRouteEnabled, isApiRouteEnabled } = await import('@/lib/module-gate')

  if (pathname.startsWith('/api/')) {
    if (!isApiRouteEnabled(pathname)) {
      return NextResponse.json(
        { error: 'Module not available', message: 'Este modulo nao esta habilitado' },
        { status: 404 }
      )
    }
  } else if (!isRouteEnabled(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Auto-detect locale — provider-agnostic
  const detectedLocale = detectLocale(request)
  if (detectedLocale) {
    response.cookies.set('locale', detectedLocale, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
