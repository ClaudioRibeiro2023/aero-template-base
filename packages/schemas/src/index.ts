/**
 * @template/schemas — Zod schemas de validação agnósticos a provider.
 *
 * Sprint 4: barrel que re-exporta de @template/shared/schemas.
 * Sprint 7 (cleanup): código migrado aqui e @template/shared/schemas passa a re-exportar daqui.
 *
 * Uso: `import { taskCreateSchema } from '@template/schemas'`
 * Benefício: apps podem importar só schemas sem puxar toda a árvore de @template/shared.
 */
export * from '@template/shared/schemas'
