import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth callback route — troca o code por sessão e redireciona ao dashboard.
 *
 * Quando o usuário faz login via Google (ou outro provider OAuth),
 * o Supabase redireciona para esta rota com um `code` query parameter.
 * Este handler troca o code por uma sessão válida via PKCE.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/dashboard'
  // Prevent open redirect — only allow relative paths starting with /
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/dashboard'

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Se algo falhar, redirecionar para login com indicação de erro
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
