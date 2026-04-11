/**
 * @template/cache — Configuração React Query agnóstica a provider.
 *
 * Sprint 4: barrel que re-exporta de @template/shared/cache.
 * Sprint 7 (cleanup): código migrado aqui e @template/shared/cache passa a re-exportar daqui.
 *
 * Uso: `import { queryClient, queryKeys, CACHE_TIMES } from '@template/cache'`
 */
export * from '@template/shared/cache'
