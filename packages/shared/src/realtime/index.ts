/**
 * @template/shared/realtime — Mensageria em tempo real.
 *
 * Sprint 6: Exporta interface IRealtimeProvider de @template/data
 * para que consumers possam depender da interface, não da implementação.
 *
 * As funções abaixo são @deprecated — usam Supabase diretamente.
 * Sprint 7 (cleanup): este barrel passará a re-exportar de @template/data/supabase.
 *
 * Migração preferida:
 * ```ts
 * // Antes:
 * import { subscribeToTable } from '@template/shared/realtime'
 *
 * // Depois (via factory da app):
 * import { getRealtimeProvider } from '@/lib/providers'
 * const realtime = getRealtimeProvider()
 * realtime.subscribeToTable('tasks', (payload) => { ... })
 * ```
 */

// Interface agnóstica — para tipagem e implementações alternativas
export type {
  IRealtimeProvider,
  ChangeEvent,
  ChannelHandle,
  TableChangePayload,
  SubscribeToTableOptions,
} from '@template/data'

// Implementações legadas (Supabase direto) — @deprecated, remover no Sprint 7
export {
  /** @deprecated Use `getRealtimeProvider().subscribeToTable()` de `@/lib/providers` */
  subscribeToTable,
  /** @deprecated Use `getRealtimeProvider().createBroadcastChannel()` de `@/lib/providers` */
  createBroadcastChannel,
  /** @deprecated Use `getRealtimeProvider().createPresenceChannel()` de `@/lib/providers` */
  createPresenceChannel,
  /** @deprecated Use `getRealtimeProvider().broadcast()` de `@/lib/providers` */
  broadcast,
  /** @deprecated Use `getRealtimeProvider().unsubscribe()` de `@/lib/providers` */
  unsubscribe,
  type RealtimeOptions,
} from './supabaseRealtime'
