/**
 * @template/auth — Autenticação e autorização agnósticos a provider.
 *
 * Sprint 4: barrel que re-exporta de @template/shared/auth.
 * Sprint 7 (cleanup): código migrado aqui e @template/shared/auth passa a re-exportar daqui.
 *
 * Uso: `import { useAuth, hasPermission, SupabaseAuthProvider } from '@template/auth'`
 */
export * from '@template/shared/auth'
