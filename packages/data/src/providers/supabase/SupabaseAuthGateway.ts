/**
 * SupabaseAuthGateway — Verifica autenticação via Supabase Auth (cookie-based).
 *
 * Extrai e encapsula a lógica que antes vivia em apps/web/lib/auth-guard.ts.
 * Usa @supabase/ssr para ler cookies e validar o JWT server-side via getUser().
 */
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import type { UserRole } from '@template/types'
import type {
  IAuthGateway,
  AuthGatewayResult,
  AuthenticatedUser,
} from '../../interfaces/IAuthGateway'

export class SupabaseAuthGateway implements IAuthGateway {
  async getUser(): Promise<AuthGatewayResult> {
    const client = await this.createCookieClient()

    const {
      data: { user },
      error,
    } = await client.auth.getUser()

    if (error || !user) {
      return { user: null, error: 'Unauthorized' }
    }

    // Buscar role do perfil
    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return {
      user: {
        id: user.id,
        email: user.email ?? '',
        role: (profile?.role ?? 'VIEWER') as UserRole,
      },
      error: null,
    }
  }

  async requireRole(roles: UserRole | UserRole[]): Promise<AuthenticatedUser | null> {
    const { user } = await this.getUser()
    if (!user) return null

    const allowed = Array.isArray(roles) ? roles : [roles]
    if (!allowed.includes(user.role)) return null

    return user
  }

  /**
   * Cria cliente Supabase cookie-based para validação de auth.
   * Lógica idêntica à de createSupabaseCookieClient() existente.
   */
  private async createCookieClient() {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()

    const cookieMethods: CookieMethodsServer = {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options)
          } catch {
            // Ignorar erros em contextos read-only
          }
        })
      },
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    return createServerClient(url, key, { cookies: cookieMethods })
  }
}
