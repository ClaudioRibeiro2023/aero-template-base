/**
 * @template/api — Cliente HTTP agnóstico a provider.
 *
 * ESTADO ATUAL: alias/barrel para @template/shared/api.
 * Este package existe para garantir imports estáveis (`@template/api`) enquanto
 * o código reside em @template/shared/api. Seguirá sendo alias até refatoração futura.
 *
 * NÃO há breaking change planejada — o alias garante compatibilidade com todo código
 * que já importa de @template/api.
 *
 * Exports disponíveis:
 *   - apiClient                  — singleton do cliente HTTP com interceptors
 *   - createApiClient(config)    — factory para criar cliente customizado
 *   - CircuitBreaker             — proteção contra falhas em cascata
 *   - ApiError, ApiResponse      — tipos de resposta
 *
 * Uso: `import { apiClient, createApiClient } from '@template/api'`
 */
export * from '@template/shared/api'
