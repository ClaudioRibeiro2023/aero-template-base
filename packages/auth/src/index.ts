/**
 * @template/auth — Autenticação e autorização agnósticos a provider.
 *
 * ESTADO ATUAL: alias/barrel para @template/shared/auth.
 * Este package existe para garantir imports estáveis (`@template/auth`) enquanto
 * o código reside em @template/shared/auth. A inversão (código aqui, shared re-exporta)
 * está planejada para uma refatoração futura e não tem prazo fixo.
 *
 * NÃO há breaking change em mover o código para cá — o alias garante compatibilidade.
 *
 * Exports disponíveis:
 *   - useAuth()                  — hook React agnóstico a provider
 *   - SupabaseAuthProvider       — implementação Supabase (default)
 *   - DemoAuthProvider           — mock para testes/dev sem Supabase
 *   - hasPermission(role, res, action) — verificação de permissão
 *   - ROLE_PERMISSIONS           — matriz de permissões por role
 *   - AuthUser, AuthContextType  — tipos principais
 *
 * Uso: `import { useAuth, hasPermission, SupabaseAuthProvider } from '@template/auth'`
 */
export * from '@template/shared/auth'
