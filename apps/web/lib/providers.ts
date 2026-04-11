/**
 * Factory central de providers de infraestrutura (Storage, Realtime, Email).
 *
 * ÚNICO arquivo que sabe qual provider está ativo para cada domínio.
 * Para trocar: criar nova implementação de IXxxProvider e setar a env var.
 *
 * Env vars:
 *   STORAGE_PROVIDER  — 'supabase' (default)
 *   REALTIME_PROVIDER — 'supabase' (default)
 *   EMAIL_PROVIDER    — 'resend'   (default)
 *
 * Uso:
 * ```ts
 * import { getStorageProvider, getRealtimeProvider, getEmailProvider } from '@/lib/providers'
 * const storage = getStorageProvider()
 * await storage.uploadFile(file, { bucket: 'avatars' })
 *
 * const email = getEmailProvider()
 * await email.send({ to: 'user@example.com', subject: 'Olá', html: '<p>Oi</p>' })
 * ```
 */

import { SupabaseStorageProvider, SupabaseRealtimeProvider } from '@template/data/supabase'
import { ResendEmailProvider } from '@template/data/resend'
import type { IStorageProvider, IRealtimeProvider, IEmailProvider } from '@template/data'

// Singletons — instanciados uma vez por processo (server) ou módulo (client)
let _storageProvider: IStorageProvider | null = null
let _realtimeProvider: IRealtimeProvider | null = null
let _emailProvider: IEmailProvider | null = null

/**
 * Retorna o provider de storage ativo.
 * Controlado por STORAGE_PROVIDER env var (default: 'supabase').
 */
export function getStorageProvider(): IStorageProvider {
  if (_storageProvider) return _storageProvider

  const providerName = process.env.STORAGE_PROVIDER ?? 'supabase'

  switch (providerName) {
    case 'supabase':
      _storageProvider = new SupabaseStorageProvider()
      break
    default:
      throw new Error(
        `[providers] Storage provider desconhecido: "${providerName}". ` +
          `Valores suportados: supabase`
      )
  }

  return _storageProvider
}

/**
 * Retorna o provider de realtime ativo.
 * Controlado por REALTIME_PROVIDER env var (default: 'supabase').
 */
export function getRealtimeProvider(): IRealtimeProvider {
  if (_realtimeProvider) return _realtimeProvider

  const providerName = process.env.REALTIME_PROVIDER ?? 'supabase'

  switch (providerName) {
    case 'supabase':
      _realtimeProvider = new SupabaseRealtimeProvider()
      break
    default:
      throw new Error(
        `[providers] Realtime provider desconhecido: "${providerName}". ` +
          `Valores suportados: supabase`
      )
  }

  return _realtimeProvider
}

/**
 * Retorna o provider de e-mail ativo.
 * Controlado por EMAIL_PROVIDER env var (default: 'resend').
 */
export function getEmailProvider(): IEmailProvider {
  if (_emailProvider) return _emailProvider

  const providerName = process.env.EMAIL_PROVIDER ?? 'resend'

  switch (providerName) {
    case 'resend':
      _emailProvider = new ResendEmailProvider()
      break
    default:
      throw new Error(
        `[providers] Email provider desconhecido: "${providerName}". ` +
          `Valores suportados: resend`
      )
  }

  return _emailProvider
}

/** Limpa singletons — útil em testes */
export function resetProviders(): void {
  _storageProvider = null
  _realtimeProvider = null
  _emailProvider = null
}
