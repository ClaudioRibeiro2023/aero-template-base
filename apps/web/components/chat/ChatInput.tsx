'use client'

/**
 * ChatInput — área de entrada de mensagens do agente.
 *
 * Enter envia, Shift+Enter adiciona nova linha.
 * Desabilitado durante carregamento.
 */
import { useRef, type KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const value = textareaRef.current?.value.trim()
    if (!value || isLoading) return
    onSend(value)
    if (textareaRef.current) {
      textareaRef.current.value = ''
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <div className="border-t border-white/[0.06] p-3">
      <div className="flex items-end gap-2 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-[var(--brand-primary)]/40 transition-colors">
        <textarea
          ref={textareaRef}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Mensagem… (Enter para enviar)"
          rows={1}
          disabled={isLoading}
          aria-label="Mensagem para o agente"
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none outline-none leading-relaxed max-h-[120px] disabled:opacity-50"
        />
        <button
          type="button"
          onClick={submit}
          disabled={isLoading}
          aria-label="Enviar mensagem"
          className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--brand-primary)] text-white flex items-center justify-center hover:bg-[var(--brand-primary)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={13} className="animate-spin" aria-hidden="true" />
          ) : (
            <Send size={13} aria-hidden="true" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-[var(--text-muted)] mt-1.5 px-1">
        Shift+Enter para nova linha
      </p>
    </div>
  )
}
