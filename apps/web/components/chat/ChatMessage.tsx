'use client'

/**
 * ChatMessage — bolha de mensagem individual do agente.
 *
 * Suporta role user/assistant com markdown básico (parágrafos).
 * Exibe ferramentas usadas e latência quando disponível (role=assistant).
 */
import { Bot, User, Wrench, Clock } from 'lucide-react'
import { ActionCard, type ActionCardData } from './ActionCard'

export interface ChatMessageData {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolsUsed?: string[]
  latencyMs?: number
  pendingActions?: ActionCardData[]
  onConfirmAction?: (actionId: string) => void
  onCancelAction?: (actionId: string) => void
  createdAt: Date
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-[var(--brand-primary)]/20 text-[var(--brand-primary)]'
            : 'bg-zinc-500/20 text-zinc-300'
        }`}
        aria-hidden="true"
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}
      >
        <div
          className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
            isUser
              ? 'bg-[var(--brand-primary)] text-white rounded-tr-sm'
              : 'bg-white/[0.05] border border-white/[0.08] text-[var(--text-primary)] rounded-tl-sm'
          }`}
        >
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={line === '' ? 'h-2' : ''}>
              {line}
            </p>
          ))}
        </div>

        {/* Metadata (ferramentas + latência) — só assistant */}
        {!isUser && (message.toolsUsed?.length || message.latencyMs) && (
          <div className="flex flex-wrap items-center gap-2 px-1">
            {message.toolsUsed?.map(tool => (
              <span
                key={tool}
                className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded"
              >
                <Wrench size={9} aria-hidden="true" />
                {tool}
              </span>
            ))}
            {message.latencyMs && (
              <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                <Clock size={9} aria-hidden="true" />
                {message.latencyMs}ms
              </span>
            )}
          </div>
        )}

        {/* Pending actions (Sprint 6) */}
        {!isUser && message.pendingActions && message.pendingActions.length > 0 && (
          <div className="space-y-2 w-full max-w-[80%]">
            {message.pendingActions.map(action => (
              <ActionCard
                key={action.id}
                action={action}
                onConfirm={message.onConfirmAction ?? (() => {})}
                onCancel={message.onCancelAction ?? (() => {})}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
