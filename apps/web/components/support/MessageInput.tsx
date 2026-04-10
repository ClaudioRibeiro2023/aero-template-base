'use client'

import { useState } from 'react'
import { Send, Loader2, Shield } from 'lucide-react'

export function MessageInput({
  onSend,
  isPending,
  showInternalToggle,
}: {
  onSend: (content: string, isInternal: boolean) => void
  isPending: boolean
  showInternalToggle?: boolean
}) {
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return
    onSend(trimmed, isInternal)
    setContent('')
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-4 space-y-3">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Escreva sua mensagem..."
        rows={3}
        className="w-full px-3 py-2 text-sm rounded-lg bg-white/[0.03] border border-[rgba(255,255,255,0.08)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/30 transition-colors resize-none"
        disabled={isPending}
      />
      <div className="flex items-center justify-between">
        {showInternalToggle ? (
          <button
            type="button"
            onClick={() => setIsInternal(!isInternal)}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
              isInternal
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <Shield size={12} aria-hidden="true" />
            Nota Interna
          </button>
        ) : (
          <div />
        )}
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          ) : (
            <Send size={14} aria-hidden="true" />
          )}
          Enviar
        </button>
      </div>
    </form>
  )
}
