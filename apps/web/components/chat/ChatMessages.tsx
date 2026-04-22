'use client'

/**
 * ChatMessages — lista rolável de mensagens com auto-scroll.
 *
 * Usa useEffect para rolar ao final quando novas mensagens chegam.
 * Exibe shimmer de "digitando" enquanto aguarda resposta do agente.
 */
import { useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import { ChatMessage, type ChatMessageData } from './ChatMessage'

interface ChatMessagesProps {
  messages: ChatMessageData[]
  isLoading: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
        <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center">
          <Bot size={22} className="text-[var(--brand-primary)]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Olá! Como posso ajudar?</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Faça uma pergunta ou descreva o que precisa.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 px-3">
      {messages.map(msg => (
        <ChatMessage key={msg.id} message={msg} />
      ))}

      {/* Typing indicator */}
      {isLoading && (
        <div className="flex gap-3">
          <div
            className="flex-shrink-0 w-7 h-7 rounded-full bg-zinc-500/20 text-zinc-300 flex items-center justify-center"
            aria-hidden="true"
          >
            <Bot size={14} />
          </div>
          <div className="bg-white/[0.05] border border-white/[0.08] rounded-xl rounded-tl-sm px-4 py-3">
            <div className="flex gap-1 items-center" role="status" aria-label="Agente digitando">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
