'use client'

/**
 * useChat — estado completo do agente conversacional.
 *
 * Sprint 2: sessionId persistido em localStorage por appId.
 * Isso permite retomar a conversa após reload da página.
 *
 * Regras de sessão:
 * - Na primeira montagem, lê sessionId do localStorage (se existir)
 * - Após cada resposta, atualiza sessionId com o retornado pelo backend
 * - clearSession() apaga o localStorage e gera novo sessionId
 * - Chave de localStorage: `agent_session_<appId>` (isolada por app)
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessageData } from '@/components/chat'

// crypto.randomUUID() é Web API disponível em browsers modernos
const uuid = () => crypto.randomUUID()

// ─── Chave de localStorage por appId ─────────────────────────────────────────

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
  } catch {
    // Ignorar erros de localStorage (modo privado, storage cheio, etc.)
  }
}

function clearStoredSessionId(appId: string) {
  try {
    localStorage.removeItem(storageKey(appId))
  } catch {
    // ignora
  }
}

// ─── Tipos exportados ─────────────────────────────────────────────────────────

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

  // Inicializa sessionId com valor do localStorage (se existir)
  // useRef para não causar re-render ao atualizar
  const sessionIdRef = useRef<string>(uuid())

  // Após hydratação, restaura sessionId do localStorage
  useEffect(() => {
    const stored = readStoredSessionId(appId)
    if (stored) {
      sessionIdRef.current = stored
    }
  }, [appId])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(v => !v), [])

  const clearSession = useCallback(() => {
    setMessages([])
    const newId = uuid()
    sessionIdRef.current = newId
    clearStoredSessionId(appId)
    // Não persiste o novo UUID ainda — será persitido após primeira mensagem
  }, [appId])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isLoading) return

      // Otimistic: adiciona mensagem do usuário imediatamente
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

        // Sincroniza sessionId com o retornado pelo backend (pode ser novo)
        if (json.data.session?.id) {
          sessionIdRef.current = json.data.session.id
          writeStoredSessionId(appId, json.data.session.id)
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
