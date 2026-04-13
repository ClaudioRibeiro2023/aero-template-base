import { env } from '@/lib/env'
/**
 * useWebSocket — Sprint 26
 * Manages a WebSocket connection to the backend /ws endpoint.
 * Supports connecting, disconnecting, sending messages and subscribing to typed events.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export type WSMessageType =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'heartbeat'
  | 'notification'
  | 'alert'
  | 'data.created'
  | 'data.updated'
  | 'data.deleted'
  | 'user.joined'
  | 'user.left'
  | 'user.typing'
  | 'custom'

export interface WSMessage {
  type: WSMessageType
  payload?: Record<string, unknown>
  timestamp: string
}

export type WSStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface UseWebSocketOptions {
  /** Automatically connect on mount */
  autoConnect?: boolean
  /** Reconnect on unexpected close */
  autoReconnect?: boolean
  /** Max reconnect attempts (default 5) */
  maxReconnectAttempts?: number
  /** Base delay between reconnect attempts in ms (default 1000) */
  reconnectDelay?: number
  /** Rooms to join on connect (comma-separated) */
  rooms?: string[]
  /** Called on every message received */
  onMessage?: (message: WSMessage) => void
  /** Called when connection is established */
  onConnect?: () => void
  /** Called when connection is closed */
  onDisconnect?: () => void
}

export interface UseWebSocketReturn {
  status: WSStatus
  lastMessage: WSMessage | null
  send: (message: Omit<WSMessage, 'timestamp'>) => void
  connect: () => void
  disconnect: () => void
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
}

const WS_BASE_URL = env.WS_URL || ''

export function useWebSocket(
  userId: string | null,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    autoConnect = true,
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectDelay = 1000,
    rooms = [],
    onMessage,
    onConnect,
    onDisconnect,
  } = options

  const [status, setStatus] = useState<WSStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unmounting = useRef(false)

  const buildUrl = useCallback(() => {
    if (!userId) return null
    const params = new URLSearchParams({ user_id: userId })
    if (rooms.length > 0) params.set('rooms', rooms.join(','))
    return `${WS_BASE_URL}/ws?${params.toString()}`
  }, [userId, rooms])

  const connect = useCallback(() => {
    if (!userId || !WS_BASE_URL) return
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const url = buildUrl()
    if (!url) return

    setStatus('connecting')

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setStatus('connected')
      reconnectAttempts.current = 0
      onConnect?.()
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as WSMessage
        setLastMessage(msg)
        onMessage?.(msg)
      } catch {
        // ignore malformed frames
      }
    }

    ws.onerror = () => {
      setStatus('error')
    }

    ws.onclose = () => {
      setStatus('disconnected')
      wsRef.current = null
      onDisconnect?.()

      if (
        autoReconnect &&
        !unmounting.current &&
        reconnectAttempts.current < maxReconnectAttempts
      ) {
        reconnectAttempts.current += 1
        const delay = reconnectDelay * Math.pow(2, reconnectAttempts.current - 1)
        reconnectTimer.current = setTimeout(() => {
          connect()
        }, delay)
      }
    }
  }, [
    userId,
    buildUrl,
    autoReconnect,
    maxReconnectAttempts,
    reconnectDelay,
    onConnect,
    onDisconnect,
    onMessage,
  ])

  const disconnect = useCallback(() => {
    unmounting.current = true
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    wsRef.current?.close()
    wsRef.current = null
    setStatus('disconnected')
  }, [])

  const send = useCallback((message: Omit<WSMessage, 'timestamp'>) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ ...message, timestamp: new Date().toISOString() }))
  }, [])

  const joinRoom = useCallback(
    (roomId: string) => {
      send({ type: 'custom', payload: { action: 'join_room', room_id: roomId } })
    },
    [send]
  )

  const leaveRoom = useCallback(
    (roomId: string) => {
      send({ type: 'custom', payload: { action: 'leave_room', room_id: roomId } })
    },
    [send]
  )

  useEffect(() => {
    unmounting.current = false
    if (autoConnect && userId) connect()
    return () => {
      unmounting.current = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return { status, lastMessage, send, connect, disconnect, joinRoom, leaveRoom }
}
