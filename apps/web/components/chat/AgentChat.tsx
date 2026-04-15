'use client'

/**
 * AgentChat — ponto de entrada único do Conversation OS.
 *
 * Adicione ao layout principal (ex: app/(dashboard)/layout.tsx):
 *
 *   import { AgentChat } from '@/components/chat/AgentChat'
 *
 *   export default function DashboardLayout({ children }) {
 *     return (
 *       <>
 *         {children}
 *         <AgentChat appId="web" />
 *       </>
 *     )
 *   }
 *
 * Props:
 *   appId — domínio da aplicação (resolve Domain Pack no backend).
 *           Padrão: 'web' (usa coreDomainPack).
 */
import { useChat } from '@/hooks/useChat'
import { ChatButton } from './ChatButton'
import { ChatPanel } from './ChatPanel'

interface AgentChatProps {
  appId?: string
}

export function AgentChat({ appId = 'web' }: AgentChatProps) {
  const chat = useChat(appId)

  return (
    <>
      {chat.isOpen && <ChatPanel chat={chat} />}
      <ChatButton isOpen={chat.isOpen} onClick={chat.toggle} />
    </>
  )
}
