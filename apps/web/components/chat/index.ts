/**
 * @template/chat — Componentes base do agente conversacional.
 *
 * Uso:
 *   import { ChatButton, ChatPanel } from '@/components/chat'
 *   import { useChat } from '@/hooks/useChat'
 *
 *   const chat = useChat()
 *   return (
 *     <>
 *       {chat.isOpen && <ChatPanel chat={chat} />}
 *       <ChatButton isOpen={chat.isOpen} onClick={chat.toggle} />
 *     </>
 *   )
 */
export { AgentChat } from './AgentChat'
export { ChatButton } from './ChatButton'
export { ChatPanel } from './ChatPanel'
export { ChatMessages } from './ChatMessages'
export { ChatMessage } from './ChatMessage'
export { ChatInput } from './ChatInput'
export type { ChatMessageData } from './ChatMessage'
