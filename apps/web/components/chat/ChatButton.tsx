'use client'

/**
 * ChatButton — botão flutuante para abrir/fechar o painel do agente.
 *
 * Inclui badge de notificação quando há mensagens não lidas.
 * Posicionamento: bottom-right, fixed, z-50.
 */
import { Bot, X } from 'lucide-react'

interface ChatButtonProps {
  isOpen: boolean
  unreadCount?: number
  onClick: () => void
}

export function ChatButton({ isOpen, unreadCount = 0, onClick }: ChatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Fechar assistente IA' : 'Abrir assistente IA'}
      aria-expanded={isOpen}
      className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-[var(--brand-primary)] text-white shadow-lg hover:bg-[var(--brand-primary)]/90 active:scale-95 transition-all duration-150 flex items-center justify-center"
    >
      {isOpen ? (
        <X size={20} aria-hidden="true" />
      ) : (
        <>
          <Bot size={20} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-label={`${unreadCount} mensagens não lidas`}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  )
}
