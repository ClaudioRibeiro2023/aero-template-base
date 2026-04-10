'use client'

import { User, Shield } from 'lucide-react'
import type { SupportMessage } from '@/services/supportMessages'

export function ConversationThread({
  messages,
  currentUserId,
}: {
  messages: SupportMessage[]
  currentUserId: string
}) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[var(--text-muted)]">
        Nenhuma mensagem ainda. Envie a primeira resposta.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map(msg => {
        const isOwn = msg.created_by === currentUserId
        const isInternal = msg.is_internal

        return (
          <div
            key={msg.id}
            className={`glass-panel p-4 ${isInternal ? 'border-amber-500/20 bg-amber-500/[0.03]' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isOwn
                    ? 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]'
                    : 'bg-zinc-500/20 text-zinc-400'
                }`}
              >
                {isInternal ? (
                  <Shield size={12} aria-hidden="true" />
                ) : (
                  <User size={12} aria-hidden="true" />
                )}
              </div>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {isOwn ? 'Você' : 'Suporte'}
              </span>
              {isInternal && (
                <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Nota Interna
                </span>
              )}
              <span className="text-[11px] text-[var(--text-muted)] ml-auto">
                {new Date(msg.created_at).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{msg.content}</p>
          </div>
        )
      })}
    </div>
  )
}
