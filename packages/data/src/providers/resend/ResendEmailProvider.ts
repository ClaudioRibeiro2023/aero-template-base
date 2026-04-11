/**
 * ResendEmailProvider — implementação de IEmailProvider para Resend.
 *
 * Usa a API REST do Resend diretamente (sem SDK) para manter o package
 * sem dependências extras. Basta a env var RESEND_API_KEY.
 *
 * Para trocar para SendGrid: criar SendGridEmailProvider implementando IEmailProvider
 * e setar EMAIL_PROVIDER=sendgrid.
 */
import type { IEmailProvider, EmailMessage, EmailSendResult } from '../../interfaces/IEmailProvider'

const RESEND_API_URL = 'https://api.resend.com/emails'

interface ResendResponse {
  id?: string
  error?: { message: string; name: string }
}

export class ResendEmailProvider implements IEmailProvider {
  private readonly apiKey: string
  private readonly defaultFrom: string

  constructor() {
    const key = process.env.RESEND_API_KEY
    if (!key) {
      throw new Error(
        '[ResendEmailProvider] RESEND_API_KEY não configurada. ' +
          'Definir a variável de ambiente antes de usar o provider.'
      )
    }
    this.apiKey = key
    this.defaultFrom = process.env.EMAIL_FROM ?? 'noreply@exemplo.com.br'
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const body = {
      from: message.from ?? this.defaultFrom,
      to: Array.isArray(message.to) ? message.to : [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      cc: message.cc ? (Array.isArray(message.cc) ? message.cc : [message.cc]) : undefined,
      bcc: message.bcc ? (Array.isArray(message.bcc) ? message.bcc : [message.bcc]) : undefined,
      reply_to: message.replyTo,
      tags: message.tags
        ? Object.entries(message.tags).map(([name, value]) => ({ name, value }))
        : undefined,
    }

    try {
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = (await response.json()) as ResendResponse

      if (!response.ok || data.error) {
        return {
          id: null,
          error: data.error?.message ?? `HTTP ${response.status}`,
        }
      }

      return { id: data.id ?? null, error: null }
    } catch (err) {
      return {
        id: null,
        error: err instanceof Error ? err.message : 'Erro desconhecido ao enviar e-mail',
      }
    }
  }

  async sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]> {
    // Resend suporta batch nativo via /emails/batch, mas usamos envio sequencial
    // para manter o provider simples. Substituir por chamada batch se necessário.
    return Promise.all(messages.map(m => this.send(m)))
  }
}
