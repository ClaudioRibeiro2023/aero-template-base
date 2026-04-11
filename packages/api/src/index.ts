/**
 * @template/api — Cliente HTTP agnóstico a provider.
 *
 * Sprint 4: barrel que re-exporta de @template/shared/api.
 * Sprint 7 (cleanup): código migrado aqui e @template/shared/api passa a re-exportar daqui.
 *
 * Uso: `import { createApiClient, CircuitBreaker } from '@template/api'`
 */
export * from '@template/shared/api'
