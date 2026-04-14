/**
 * server-auth-provider.ts — Abstração de autenticação server-side para middleware.
 *
 * IServerAuthProvider valida requests no middleware Next.js e retorna:
 * - user: usuário autenticado ou null
 * - response: NextResponse com cookies de sessão atualizados (cookie dance SSR)
 *
 * Factory `getServerAuthProvider()` lê AUTH_PROVIDER (default: 'supabase').
 * Para trocar de provider, setar AUTH_PROVIDER=nextauth e implementar NextAuthServerAuth.
 *
 * Sprint 3 — Template.Base v3.0
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { AuthenticatedUser } from '@template/data'
import type { UserRole } from '@template/types'

// ─────────────────────────────────────────────────────────────────────────────
// Interface
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidateRequestResult {
  /** Usuário autenticado, ou null se não autenticado / sessão inválida */
  user: AuthenticatedUser | null
  /** NextResponse com cookies de sessão atualizados (DEVE ser retornado pelo middleware) */
  response: NextResponse
}

export interface IServerAuthProvider {
  /**
   * Valida o request no middleware.
   * Atualiza cookies de sessão quando necessário.
   * @returns `{ user, response }` — sempre retorna um response válido.
   */
  validateRequest(request: NextRequest): Promise<ValidateRequestResult>
}

// ─────────────────────────────────────────────────────────────────────────────
// Implementação Supabase
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Provider de auth server-side usando @supabase/ssr.
 * Extrai a lógica exata do middleware.ts v2.7 (linhas 41-79).
 * Cookie dance: garante que tokens refreshados sejam propagados no response.
 */
export class SupabaseServerAuth implements IServerAuthProvider {
  async validateRequest(request: NextRequest): Promise<ValidateRequestResult> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Supabase não configurado
    if (!supabaseUrl || !supabaseKey) {
      return {
        user: null,
        response: NextResponse.next({ request }),
      }
    }

    // Cookie dance: supabaseResponse deve ser mutado pelo setAll para propagar tokens
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
      return { user: null, response: supabaseResponse }
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email ?? '',
      // Role extraído de app_metadata (imutável pelo client — seguro para RBAC).
      // Supabase getUser() já retorna app_metadata sem query extra.
      role: ((user.app_metadata?.role as string) || 'VIEWER').toUpperCase() as UserRole,
    }

    return { user: authenticatedUser, response: supabaseResponse }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

let _serverAuthProvider: IServerAuthProvider | null = null

/**
 * Retorna o provider de auth server-side configurado via AUTH_PROVIDER env var.
 *
 * AUTH_PROVIDER=supabase  → SupabaseServerAuth (default)
 * AUTH_PROVIDER=demo      → passa por sem auth (dev only)
 *
 * Para adicionar NextAuth: criar NextAuthServerAuth implementando IServerAuthProvider
 * e registrar aqui com AUTH_PROVIDER=nextauth.
 */
export function getServerAuthProvider(): IServerAuthProvider {
  if (_serverAuthProvider) return _serverAuthProvider

  const providerName = process.env.AUTH_PROVIDER ?? 'supabase'

  switch (providerName) {
    case 'supabase':
      _serverAuthProvider = new SupabaseServerAuth()
      break
    default:
      // Fallback seguro: supabase
      console.warn(
        `[auth-provider] AUTH_PROVIDER="${providerName}" não reconhecido. Usando supabase.`
      )
      _serverAuthProvider = new SupabaseServerAuth()
  }

  return _serverAuthProvider
}
