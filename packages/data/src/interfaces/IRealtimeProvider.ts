/**
 * IRealtimeProvider — interface agnóstica de provider para mensageria em tempo real.
 *
 * Implementações concretas: SupabaseRealtimeProvider, AblyRealtimeProvider, etc.
 */

export type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

export interface TableChangePayload<T = Record<string, unknown>> {
  eventType: ChangeEvent
  new: T | null
  old: T | null
  table: string
  schema: string
}

export interface SubscribeToTableOptions {
  event?: ChangeEvent
  filter?: string
}

/**
 * Handle opaco retornado por subscribeToTable/createChannel.
 * O caller deve passá-lo de volta para unsubscribe().
 */
export type ChannelHandle = unknown

export interface IRealtimeProvider {
  /**
   * Subscreve a mudanças em uma tabela do banco.
   * @returns handle para desinscrição
   */
  subscribeToTable<T extends Record<string, unknown>>(
    table: string,
    callback: (payload: TableChangePayload<T>) => void,
    options?: SubscribeToTableOptions
  ): ChannelHandle

  /**
   * Cria um canal de broadcast para mensagens customizadas.
   * @returns handle para desinscrição
   */
  createBroadcastChannel(
    channelName: string,
    onMessage: (event: string, payload: Record<string, unknown>) => void
  ): ChannelHandle

  /**
   * Envia mensagem de broadcast em um canal.
   */
  broadcast(channel: ChannelHandle, event: string, payload: Record<string, unknown>): Promise<void>

  /**
   * Cria canal de presença para rastrear usuários online.
   * @returns handle para desinscrição
   */
  createPresenceChannel(
    channelName: string,
    userInfo: Record<string, unknown>,
    onSync: (presences: Record<string, unknown[]>) => void
  ): ChannelHandle

  /**
   * Cancela a inscrição e libera recursos de um canal.
   */
  unsubscribe(channel: ChannelHandle): Promise<void>
}
