/**
 * IAuthGateway — Interface para verificação de autenticação server-side.
 *
 * Usado em API routes para validar o usuário da request atual.
 * Implementações: SupabaseAuthGateway, DemoAuthGateway, etc.
 */
import type { UserRole } from '@template/types'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
}

export interface AuthGatewayResult {
  user: AuthenticatedUser | null
  error: string | null
}

export interface IAuthGateway {
  /**
   * Valida e retorna o usuário da request atual (server-side, cookie-based).
   */
  getUser(): Promise<AuthGatewayResult>

  /**
   * Valida o usuário e exige que tenha uma das roles especificadas.
   * Retorna null se não autenticado ou sem permissão.
   */
  requireRole(roles: UserRole | UserRole[]): Promise<AuthenticatedUser | null>
}
