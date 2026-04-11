/**
 * IAuthProvider — Interfaces de autenticação agnósticas a provider.
 *
 * IClientAuthProvider: operações do lado cliente (browser) — sign in, sign out,
 * sessão, eventos de mudança de estado.
 *
 * IServerAuthProvider é definido em apps/web/lib (Next.js-specific).
 */

export interface ClientSession {
  accessToken: string
  expiresAt?: number
}

export interface ClientUser {
  id: string
  email: string
  name?: string
}

/**
 * Interface de autenticação client-side agnóstica a provider.
 * Implementações: SupabaseClientAuth, NextAuthClientAuth, ClerkClientAuth, etc.
 */
export interface IClientAuthProvider {
  /** Autenticar com email + senha */
  signIn(email: string, password: string): Promise<void>

  /** Autenticar via OAuth (Google, GitHub, etc.) */
  signInWithOAuth(provider: string, redirectTo: string): Promise<void>

  /** Encerrar sessão */
  signOut(): Promise<void>

  /** Retorna sessão atual ou null */
  getSession(): Promise<ClientSession | null>

  /** Retorna usuário atual ou null */
  getUser(): Promise<ClientUser | null>

  /**
   * Registra callback para mudanças de estado de autenticação.
   * @returns Função para cancelar a assinatura (cleanup).
   */
  onAuthStateChange(callback: (user: ClientUser | null) => void): () => void
}
