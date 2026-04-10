'use client'

/**
 * useRealtimeSubscription — Hook genérico para Supabase Realtime
 *
 * Escuta mudanças em tabelas via postgres_changes e invalida
 * queries do React Query automaticamente.
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

interface RealtimeConfig {
  /** Nome da tabela Supabase */
  table: string
  /** Eventos a escutar */
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  /** Schema (default: public) */
  schema?: string
  /** Filtro opcional (ex: 'user_id=eq.xxx') */
  filter?: string
  /** Query keys a invalidar no React Query */
  queryKeys: string[][]
  /** Callback opcional ao receber evento */
  onEvent?: (payload: {
    eventType: string
    new: Record<string, unknown>
    old: Record<string, unknown>
  }) => void
  /** Habilitado? (default: true) */
  enabled?: boolean
}

export function useRealtimeSubscription({
  table,
  event = '*',
  schema = 'public',
  filter,
  queryKeys,
  onEvent,
  enabled = true,
}: RealtimeConfig) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const supabase = createSupabaseBrowserClient()
    const channelName = `realtime:${table}:${filter || 'all'}`

    const channelConfig: {
      event: string
      schema: string
      table: string
      filter?: string
    } = { event, schema, table }

    if (filter) {
      channelConfig.filter = filter
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes' as 'system', channelConfig, (payload: Record<string, unknown>) => {
        // Invalidar todas as query keys configuradas
        queryKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key })
        })

        // Callback opcional
        onEvent?.(
          payload as {
            eventType: string
            new: Record<string, unknown>
            old: Record<string, unknown>
          }
        )
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, event, schema, filter, enabled, queryClient, queryKeys, onEvent])
}

/** Hook especializado: real-time para tasks */
export function useRealtimeTasks(enabled = true) {
  useRealtimeSubscription({
    table: 'tasks',
    queryKeys: [['tasks']],
    enabled,
  })
}

/** Hook especializado: real-time para support_tickets */
export function useRealtimeTickets(enabled = true) {
  useRealtimeSubscription({
    table: 'support_tickets',
    queryKeys: [['support-tickets']],
    enabled,
  })
}

/** Hook especializado: real-time para notifications */
export function useRealtimeNotifications(userId: string, enabled = true) {
  useRealtimeSubscription({
    table: 'notifications',
    filter: userId ? `user_id=eq.${userId}` : undefined,
    queryKeys: [['notifications']],
    enabled: enabled && !!userId,
  })
}
