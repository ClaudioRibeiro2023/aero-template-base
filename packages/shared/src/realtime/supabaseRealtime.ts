/**
 * Supabase Realtime Wrapper
 *
 * Replaces custom WebSocket implementation with Supabase Realtime channels.
 * Supports: Presence, Broadcast, PostgreSQL Changes.
 *
 * Usage:
 *   import { createChannel, subscribeToTable } from '@template/shared/realtime'
 */
import { supabase } from '../supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

export interface RealtimeOptions {
  event?: ChangeEvent
  schema?: string
  table?: string
  filter?: string
}

/**
 * Subscribe to PostgreSQL table changes via Supabase Realtime.
 */
export function subscribeToTable<T extends Record<string, unknown>>(
  table: string,
  callback: (payload: RealtimePostgresChangesPayload<T>) => void,
  options: { event?: ChangeEvent; filter?: string } = {}
): RealtimeChannel {
  const filter: {
    event: ChangeEvent
    schema: string
    table: string
    filter?: string
  } = {
    event: options.event || '*',
    schema: 'public',
    table,
  }
  if (options.filter) {
    filter.filter = options.filter
  }

  const channel = supabase
    .channel(`table-${table}`)
    .on(
      'postgres_changes',
      filter,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback as any
    )
    .subscribe()

  return channel
}

/**
 * Create a broadcast channel for custom messages.
 */
export function createBroadcastChannel(
  channelName: string,
  onMessage: (event: string, payload: Record<string, unknown>) => void
): RealtimeChannel {
  const channel = supabase
    .channel(channelName)
    .on('broadcast', { event: '*' }, ({ event, payload }) => {
      onMessage(event, payload as Record<string, unknown>)
    })
    .subscribe()

  return channel
}

/**
 * Send a broadcast message on a channel.
 */
export async function broadcast(
  channel: RealtimeChannel,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event,
    payload,
  })
}

/**
 * Create a presence channel for tracking online users.
 */
export function createPresenceChannel(
  channelName: string,
  userInfo: Record<string, unknown>,
  onSync: (presences: Record<string, unknown[]>) => void
): RealtimeChannel {
  const channel = supabase
    .channel(channelName)
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      onSync(state)
    })
    .subscribe(async status => {
      if (status === 'SUBSCRIBED') {
        await channel.track(userInfo)
      }
    })

  return channel
}

/**
 * Unsubscribe and clean up a channel.
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel)
}
