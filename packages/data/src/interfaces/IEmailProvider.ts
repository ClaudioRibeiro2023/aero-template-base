/**
 * IEmailProvider — interface agnóstica de provider para envio de e-mails.
 *
 * Implementações concretas: ResendEmailProvider, SendGridEmailProvider, etc.
 *
 * Uso:
 * ```ts
 * import { getEmailProvider } from '@/lib/providers'
 * await getEmailProvider().send({
 *   to: 'usuario@empresa.com',
 *   subject: 'Bem-vindo!',
 *   html: '<p>Olá, mundo</p>',
 * })
 * ```
 */

/** Mensagem de e-mail para envio */
export interface EmailMessage {
  /** Destinatário — string simples ou `"Nome <email>"` */
  to: string | string[]
  /** Assunto */
  subject: string
  /** Corpo HTML (preferencial) */
  html?: string
  /** Corpo texto puro (fallback) */
  text?: string
  /** Remetente — override do default configurado no provider */
  from?: string
  /** CC */
  cc?: string | string[]
  /** BCC */
  bcc?: string | string[]
  /** Reply-To */
  replyTo?: string
  /** Tags para rastreamento */
  tags?: Record<string, string>
}

/** Resultado do envio */
export interface EmailSendResult {
  /** Identificador do e-mail no provider (para rastreamento) */
  id: string | null
  /** null se sucesso; mensagem de erro caso contrário */
  error: string | null
}

export interface IEmailProvider {
  /**
   * Envia um e-mail.
   */
  send(message: EmailMessage): Promise<EmailSendResult>

  /**
   * Envia múltiplos e-mails em lote.
   * Providers que não suportam batch enviam sequencialmente.
   */
  sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]>
}
