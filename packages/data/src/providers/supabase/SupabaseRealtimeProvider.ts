/**
 * SupabaseRealtimeProvider — implementação de IRealtimeProvider para Supabase Realtime.
 *
 * Wraps o código existente de `@template/shared/realtime` atrás da interface
 * agnóstica. Para trocar para Ably/Pusher: criar AblyRealtimeProvider implementando IRealtimeProvider.
 */
import { createBrowserClient } from '@supabase/ssr'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type {
  IRealtimeProvider,
  ChangeEvent,
  ChannelHandle,
  TableChangePayload,
  SubscribeToTableOptions,
} from '../../interfaces/IRealtimeProvider'

export class SupabaseRealtimeProvider implements IRealtimeProvider {
  private getClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('[SupabaseRealtimeProvider] Variáveis SUPABASE não configuradas.')
    }
    return createBrowserClient(url, key)
  }

  subscribeToTable<T extends Record<string, unknown>>(
    table: string,
    callback: (payload: TableChangePayload<T>) => void,
    options: SubscribeToTableOptions = {}
  ): ChannelHandle {
    const supabase = this.getClient()
    const event = options.event ?? '*'

    const filter: {
      event: ChangeEvent
      schema: string
      table: string
      filter?: string
    } = { event, schema: 'public', table }

    if (options.filter) filter.filter = options.filter

    const channel = supabase
      .channel(`table-${table}`)
      .on('postgres_changes', filter, (raw: RealtimePostgresChangesPayload<T>) => {
        callback({
          eventType: raw.eventType as ChangeEvent,
          new: (raw.new as T) ?? null,
          old: (raw.old as T) ?? null,
          table: raw.table,
          schema: raw.schema,
        })
      })
      .subscribe()

    return channel
  }

  createBroadcastChannel(
    channelName: string,
    onMessage: (event: string, payload: Record<string, unknown>) => void
  ): ChannelHandle {
    const supabase = this.getClient()
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: '*' }, ({ event, payload }) => {
        onMessage(event, payload as Record<string, unknown>)
      })
      .subscribe()
    return channel
  }

  async broadcast(
    channel: ChannelHandle,
    event: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const ch = channel as RealtimeChannel
    await ch.send({ type: 'broadcast', event, payload })
  }

  createPresenceChannel(
    channelName: string,
    userInfo: Record<string, unknown>,
    onSync: (presences: Record<string, unknown[]>) => void
  ): ChannelHandle {
    const supabase = this.getClient()
    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = (channel as RealtimeChannel).presenceState()
        onSync(state as Record<string, unknown[]>)
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await (channel as RealtimeChannel).track(userInfo)
        }
      })
    return channel
  }

  async unsubscribe(channel: ChannelHandle): Promise<void> {
    const supabase = this.getClient()
    await supabase.removeChannel(channel as RealtimeChannel)
  }
}
