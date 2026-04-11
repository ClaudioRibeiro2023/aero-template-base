/**
 * @template/utils — Utilitários e formatadores agnósticos a provider.
 *
 * Sprint 4: barrel que re-exporta de @template/shared/utils.
 * Sprint 7 (cleanup): código migrado aqui e @template/shared/utils passa a re-exportar daqui.
 *
 * Uso: `import { formatCurrency, debounce, logger } from '@template/utils'`
 */
export * from '@template/shared/utils'
