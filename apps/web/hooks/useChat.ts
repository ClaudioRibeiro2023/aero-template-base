'use client'

/**
 * useChat — estado completo do agente conversacional.
 *
 * Gerencia:
 * - Visibilidade do painel (open/close/toggle)
 * - Histórico de mensagens (local, Sprint 1 — sem persistência)
 * - Chamadas para POST /api/agent/chat
 * - sessionId por conversa (gerado no cliente, enviado ao backend)
 * - clearSession para reiniciar conversa
 *
 * Sprint 2: persistir sessionId + mensagens no Supabase via agentSessionService.
 */
import { useState, useCallback, useRef } from 'react'
import type { ChatMessageData } from '@/components/chat'

// crypto.randomUUID() é Web API disponível em browsers modernos e Next.js RSC/Client
const uuid = () => crypto.randomUUID()

// ─── Tipo exportado para tipagem do prop chat={...} ───────────────────────────

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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChat(appId = 'web'): UseChat {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const sessionIdRef = useRef<string>(uuid())

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(v => !v), [])

  const clearSession = useCallback(() => {
    setMessages([])
    sessionIdRef.current = uuid()
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isLoading) return

      // Adiciona mensagem do usuário imediatamente
      const userMessage: ChatMessageData = {
        id: uuid(),
        role: 'user',
        content: trimmed,
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, userMessage])
      setIsLoading(true)

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
          throw new Error(err?.error?.message ?? `HTTP ${res.status}`)
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

        // Atualiza sessionId com o retornado pelo backend (pode ter sido gerado lá)
        if (json.data.session?.id) {
          sessionIdRef.current = json.data.session.id
        }

        const assistantMessage: ChatMessageData = {
          id: uuid(),
          role: 'assistant',
          content: json.data.content || '—',
          toolsUsed: json.data.toolsUsed,
          latencyMs: json.data.latencyMs,
          createdAt: new Date(),
        }

        setMessages(prev => [...prev, assistantMessage])
      } catch (err) {
        const errorMessage: ChatMessageData = {
          id: uuid(),
          role: 'assistant',
          content:
            err instanceof Error
              ? `Erro: ${err.message}`
              : 'Ocorreu um erro ao processar sua mensagem. Tente novamente.',
          createdAt: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
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
