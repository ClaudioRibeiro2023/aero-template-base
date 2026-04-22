'use client'

/**
 * ChatPanel — painel flutuante do agente conversacional.
 *
 * Estado (aberto/fechado, mensagens, loading) é gerenciado pelo useChat hook.
 * O painel é portado para o fim do DOM via fixed positioning — não bloqueia
 * o layout da página.
 *
 * Posicionamento: bottom-right, z-50.
 */
import { Bot, RotateCcw, Minimize2 } from 'lucide-react'
import type { UseChat } from '@/hooks/useChat'
import { ChatMessages } from './ChatMessages'
import { ChatInput } from './ChatInput'

interface ChatPanelProps {
  chat: UseChat
}

export function ChatPanel({ chat }: ChatPanelProps) {
  const { messages, isLoading, sendMessage, clearSession } = chat

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Assistente IA"
      className="fixed bottom-20 right-4 z-50 w-[360px] max-h-[520px] flex flex-col glass-panel shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-[var(--brand-primary)]/15 flex items-center justify-center">
          <Bot size={15} className="text-[var(--brand-primary)]" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Assistente</p>
          <p className="text-[10px] text-[var(--text-muted)]">
            {isLoading ? 'Processando…' : 'Online'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={clearSession}
            disabled={messages.length === 0}
            title="Nova conversa"
            aria-label="Iniciar nova conversa"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-colors disabled:opacity-30"
          >
            <RotateCcw size={13} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={chat.close}
            title="Fechar"
            aria-label="Fechar assistente"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] transition-colors"
          >
            <Minimize2 size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
