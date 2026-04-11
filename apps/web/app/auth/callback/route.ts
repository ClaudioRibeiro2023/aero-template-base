import { SupabaseDbClient } from '@template/data/supabase'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Validates redirect path to prevent open redirect attacks.
 * Must start with `/`, must not start with `//` or `/\`, and must not contain protocol schemes.
 */
function safePath(raw: string | null): string {
  const fallback = '/dashboard'
  if (!raw) return fallback
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback
  if (/^\/[^/]/.test(raw) === false) return fallback
  // Block embedded protocol schemes (e.g. /javascript:, /data:)
  if (/[:/\\]/.test(raw.charAt(1)) || raw.includes('://')) return fallback
  // Block paths with colon before second slash (e.g. /javascript:alert)
  const secondSlash = raw.indexOf('/', 1)
  const colonPos = raw.indexOf(':')
  if (colonPos !== -1 && (secondSlash === -1 || colonPos < secondSlash)) return fallback
  return raw
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safePath(searchParams.get('next'))

  if (code) {
    const db = new SupabaseDbClient()
    const supabase = await db.asUser()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
