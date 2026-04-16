'use client'

/**
 * useChat — estado completo do agente conversacional.
 *
 * Sprint 5: streaming SSE + fallback JSON
 * Sprint 6: pending actions, confirmAction, cancelAction
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessageData } from '@/components/chat'
import type { ActionCardData } from '@/components/chat/ActionCard'

const uuid = () => crypto.randomUUID()

// ─── localStorage helpers ────────────────────────────────────────────────────

function storageKey(appId: string) {
  return `agent_session_${appId}`
}

function readStoredSessionId(appId: string): string | null {
  try {
    return localStorage.getItem(storageKey(appId))
  } catch {
    return null
  }
}

function writeStoredSessionId(appId: string, sessionId: string) {
  try {
    localStorage.setItem(storageKey(appId), sessionId)
  } catch {}
}

function clearStoredSessionId(appId: string) {
  try {
    localStorage.removeItem(storageKey(appId))
  } catch {}
}

// ─── SSE parser ──────────────────────────────────────────────────────────────

interface SSEEvent {
  type: string
  content?: string
  name?: string
  success?: boolean
  error?: string
  session?: { id: string }
  sources?: Array<{ type: string; label: string; detail?: string }>
  toolsUsed?: string[]
  degraded?: boolean
  traceId?: string
  latencyMs?: number
  pendingActions?: Array<{
    id: string
    toolName: string
    description: string
    impact: string
    proposedInput?: Record<string, unknown>
  }>
}

function parseSSELine(line: string): SSEEvent | null {
  if (!line.startsWith('data: ')) return null
  try {
    return JSON.parse(line.slice(6)) as SSEEvent
  } catch {
    return null
  }
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface UseChat {
  isOpen: boolean
  messages: ChatMessageData[]
  isLoading: boolean
  sessionId: string
  open: () => void
  close: () => void
  toggle: () => void
  sendMessage: (content: string) => void
  clearSession: () => void
  confirmAction: (actionId: string) => void
  cancelAction: (actionId: string) => void
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useChat(appId = 'web'): UseChat {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sessionIdRef = useRef<string>(uuid())

  useEffect(() => {
    const stored = readStoredSessionId(appId)
    if (stored) sessionIdRef.current = stored
  }, [appId])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(v => !v), [])

  const clearSession = useCallback(() => {
    setMessages([])
    sessionIdRef.current = uuid()
    clearStoredSessionId(appId)
  }, [appId])

  // ─── Helper: update action status in messages ──────────────────
  const updateActionStatus = useCallback(
    (actionId: string, newStatus: ActionCardData['status']) => {
      setMessages(prev =>
        prev.map(msg => {
          if (!msg.pendingActions) return msg
          return {
            ...msg,
            pendingActions: msg.pendingActions.map(a =>
              a.id === actionId ? { ...a, status: newStatus } : a
            ),
          }
        })
      )
    },
    []
  )

  // ─── Confirm action ────────────────────────────────────────────
  const confirmAction = useCallback(
    async (actionId: string) => {
      updateActionStatus(actionId, 'confirming')

      try {
        const res = await fetch('/api/agent/actions/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionId }),
        })

        const json = await res.json()

        if (json.ok) {
          updateActionStatus(actionId, 'executed')
          // Add confirmation message
          setMessages(prev => [
            ...prev,
            {
              id: uuid(),
              role: 'assistant',
              content: `Ação executada com sucesso: ${json.data?.toolName ?? 'tool'}`,
              createdAt: new Date(),
            },
          ])
        } else {
          updateActionStatus(actionId, 'failed')
          setMessages(prev => [
            ...prev,
            {
              id: uuid(),
              role: 'assistant',
              content: `Erro ao executar ação: ${json.error?.message ?? 'Erro desconhecido'}`,
              createdAt: new Date(),
            },
          ])
        }
      } catch {
        updateActionStatus(actionId, 'failed')
      }
    },
    [updateActionStatus]
  )

  // ─── Cancel action ─────────────────────────────────────────────
  const cancelAction = useCallback(
    async (actionId: string) => {
      updateActionStatus(actionId, 'cancelled')

      try {
        await fetch('/api/agent/actions/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actionId }),
        })
      } catch {
        // Already marked as cancelled in UI
      }
    },
    [updateActionStatus]
  )

  // ─── Bind action callbacks to messages ─────────────────────────
  // This ensures actions in messages have the current callbacks
  const messagesWithCallbacks = messages.map(msg => ({
    ...msg,
    onConfirmAction: msg.pendingActions ? confirmAction : undefined,
    onCancelAction: msg.pendingActions ? cancelAction : undefined,
  }))

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isLoading) return

      const userMessage: ChatMessageData = {
        id: uuid(),
        role: 'user',
        content: trimmed,
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, userMessage])
      setIsLoading(true)

      const assistantId = uuid()

      try {
        // ─── Streaming ───────────────────────────────────────
        const res = await fetch('/api/agent/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            sessionId: sessionIdRef.current,
            appId,
          }),
        })

        if (!res.ok || !res.body) throw new Error('Stream indisponível')

        setMessages(prev => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '', createdAt: new Date() },
        ])

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let accumulatedContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const event = parseSSELine(line.trim())
            if (!event) continue

            if (event.type === 'delta' && event.content) {
              accumulatedContent += event.content
              const currentContent = accumulatedContent
              setMessages(prev =>
                prev.map(m => (m.id === assistantId ? { ...m, content: currentContent } : m))
              )
            } else if (event.type === 'done') {
              if (event.session?.id) {
                sessionIdRef.current = event.session.id
                writeStoredSessionId(appId, event.session.id)
              }

              const finalContent = event.content ?? accumulatedContent
              const pendingActions: ActionCardData[] = (event.pendingActions ?? []).map(a => ({
                id: a.id,
                toolName: a.toolName,
                description: a.description,
                impact: a.impact,
                details: a.proposedInput,
                status: 'pending' as const,
              }))

              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: finalContent || '—',
                        toolsUsed: event.toolsUsed,
                        latencyMs: event.latencyMs,
                        pendingActions: pendingActions.length > 0 ? pendingActions : undefined,
                      }
                    : m
                )
              )
            } else if (event.type === 'error') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: `Erro: ${event.error ?? 'Desconhecido'}` }
                    : m
                )
              )
            }
          }
        }
      } catch {
        // ─── Fallback JSON ────────────────────────────────────
        try {
          const res = await fetch('/api/agent/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: trimmed,
              sessionId: sessionIdRef.current,
              appId,
            }),
          })

          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: { message: 'Erro na requisição' } }))
            throw new Error(
              (err as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`
            )
          }

          const json = (await res.json()) as {
            ok: boolean
            data: {
              content: string
              toolsUsed?: string[]
              latencyMs?: number
              session?: { id: string }
              pendingActions?: Array<{
                id: string
                toolName: string
                description: string
                impact: string
                proposedInput?: Record<string, unknown>
              }>
            }
          }

          if (!json.ok) throw new Error('Resposta inválida do agente')

          if (json.data.session?.id) {
            sessionIdRef.current = json.data.session.id
            writeStoredSessionId(appId, json.data.session.id)
          }

          const pendingActions: ActionCardData[] = (json.data.pendingActions ?? []).map(a => ({
            id: a.id,
            toolName: a.toolName,
            description: a.description,
            impact: a.impact,
            details: a.proposedInput,
            status: 'pending' as const,
          }))

          setMessages(prev => {
            const cleaned = prev.filter(m => m.id !== assistantId)
            return [
              ...cleaned,
              {
                id: assistantId,
                role: 'assistant' as const,
                content: json.data.content || '—',
                toolsUsed: json.data.toolsUsed,
                latencyMs: json.data.latencyMs,
                pendingActions: pendingActions.length > 0 ? pendingActions : undefined,
                createdAt: new Date(),
              },
            ]
          })
        } catch (fallbackErr) {
          setMessages(prev => {
            const cleaned = prev.filter(m => m.id !== assistantId)
            return [
              ...cleaned,
              {
                id: assistantId,
                role: 'assistant' as const,
                content:
                  fallbackErr instanceof Error
                    ? `Erro: ${fallbackErr.message}`
                    : 'Ocorreu um erro ao processar sua mensagem.',
                createdAt: new Date(),
              },
            ]
          })
        }
      } finally {
        setIsLoading(false)
      }
    },
    [appId, isLoading]
  )

  return {
    isOpen,
    messages: messagesWithCallbacks,
    isLoading,
    sessionId: sessionIdRef.current,
    open,
    close,
    toggle,
    sendMessage,
    clearSession,
    confirmAction,
    cancelAction,
  }
}
