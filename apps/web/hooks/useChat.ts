'use client'

/**
 * useChat — estado completo do agente conversacional.
 *
 * Sprint 5: suporte a streaming SSE + fallback JSON.
 * sessionId persistido em localStorage por appId.
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessageData } from '@/components/chat'

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

      // ID para a mensagem do assistant (atualizada incrementalmente)
      const assistantId = uuid()

      try {
        // ─── Tentar streaming primeiro ────────────────────────────
        const res = await fetch('/api/agent/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            sessionId: sessionIdRef.current,
            appId,
          }),
        })

        if (!res.ok || !res.body) {
          throw new Error('Stream indisponível')
        }

        // Adiciona placeholder de mensagem vazio
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
              // Finaliza com metadados completos
              if (event.session?.id) {
                sessionIdRef.current = event.session.id
                writeStoredSessionId(appId, event.session.id)
              }

              const finalContent = event.content ?? accumulatedContent
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: finalContent || '—',
                        toolsUsed: event.toolsUsed,
                        latencyMs: event.latencyMs,
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
            // tool_start/tool_end are handled silently for now (content keeps streaming)
          }
        }
      } catch {
        // ─── Fallback para JSON ──────────────────────────────────
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
            }
          }

          if (!json.ok) throw new Error('Resposta inválida do agente')

          if (json.data.session?.id) {
            sessionIdRef.current = json.data.session.id
            writeStoredSessionId(appId, json.data.session.id)
          }

          setMessages(prev => {
            // Remove placeholder if exists, then add final
            const cleaned = prev.filter(m => m.id !== assistantId)
            return [
              ...cleaned,
              {
                id: assistantId,
                role: 'assistant' as const,
                content: json.data.content || '—',
                toolsUsed: json.data.toolsUsed,
                latencyMs: json.data.latencyMs,
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
    messages,
    isLoading,
    sessionId: sessionIdRef.current,
    open,
    close,
    toggle,
    sendMessage,
    clearSession,
  }
}
