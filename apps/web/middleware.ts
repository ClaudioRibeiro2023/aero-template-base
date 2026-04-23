/**
 * middleware.ts — Proteção de rotas + locale detection.
 *
 * v3.0: Auth delegado para getServerAuthProvider() (padrão: SupabaseServerAuth).
 * Para trocar o provider de auth, setar AUTH_PROVIDER=nextauth (ou outro).
 * Locale detection é provider-agnostic e permanece aqui.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { getServerAuthProvider } from '@/lib/server-auth-provider'

const publicPaths = [
  '/login',
  '/register',
  '/auth/callback',
  '/api/health',
  '/api/telemetry/errors',
]
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
    // Em /login e /register: (a) se já há sessão válida, redirect para /dashboard;
    // (b) senão, limpar cookies sb-* stale que causam loop de refresh_token
    // (@supabase/ssr força autoRefreshToken=true em browser, ignora override do usuario,
    // entao a unica defesa e remover o refresh_token stale antes do client inicializar).
    if (pathname === '/login' || pathname === '/register') {
      const hasSupabaseConfigured =
        !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

      if (!isDemoMode && hasSupabaseConfigured) {
        try {
          const { user } = await getServerAuthProvider().validateRequest(request)
          if (user) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
          }
        } catch {
          // ignore — cai no fluxo de limpeza abaixo
        }
      }

      const response = NextResponse.next()
      for (const c of request.cookies.getAll()) {
        if (c.name.startsWith('sb-')) {
          response.cookies.set(c.name, '', { maxAge: 0, path: '/' })
        }
      }
      return response
    }
    return NextResponse.next()
  }

  // Demo mode: bypass auth (Supabase não necessário)
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // Module gating still applies in demo mode
    const { isRouteEnabled, isApiRouteEnabled } = await import('@/lib/module-gate')
    if (pathname.startsWith('/api/')) {
      if (!isApiRouteEnabled(pathname)) {
        return NextResponse.json(
          { error: 'Module not available', message: 'Este modulo nao esta habilitado' },
          { status: 404 }
        )
      }
    } else if (!isRouteEnabled(pathname)) {
      const moduleName = pathname.split('/').filter(Boolean)[0] || 'modulo'
      return NextResponse.redirect(
        new URL(`/dashboard?disabled=${encodeURIComponent(moduleName)}`, request.url)
      )
    }
    // Auto-detect locale in demo mode too
    const detectedLocale = detectLocale(request)
    const resp = NextResponse.next()
    if (detectedLocale) {
      resp.cookies.set('locale', detectedLocale, {
        path: '/',
        maxAge: 31536000,
        sameSite: 'lax',
      })
    }
    return resp
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
    const moduleName = pathname.split('/').filter(Boolean)[0] || 'modulo'
    return NextResponse.redirect(
      new URL(`/dashboard?disabled=${encodeURIComponent(moduleName)}`, request.url)
    )
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
  // Exclui assets estaticos (Next interno + arquivos com extensao comum em /public).
  // Sem a exclusao por extensao, arquivos como /aero-logo.png passam pelo middleware
  // e sao redirecionados para /login, quebrando imagens em rotas publicas.
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|manifest\\.json|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|bmp|txt|xml|json|webmanifest|woff|woff2|ttf|otf|map)$).*)',
  ],
}
