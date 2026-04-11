/**
 * @template/shared/storage — Acesso a storage de arquivos.
 *
 * Sprint 6: Exporta interface IStorageProvider de @template/data
 * para que consumers possam depender da interface, não da implementação.
 *
 * As funções abaixo são @deprecated — usam Supabase diretamente.
 * Sprint 7 (cleanup): este barrel passará a re-exportar de @template/data/supabase.
 *
 * Migração preferida:
 * ```ts
 * // Antes:
 * import { uploadFile } from '@template/shared/storage'
 *
 * // Depois (via factory da app):
 * import { getStorageProvider } from '@/lib/providers'
 * const storage = getStorageProvider()
 * await storage.uploadFile(file, { bucket: 'avatars' })
 * ```
 */

// Interface agnóstica — para tipagem e implementações alternativas
export type {
  IStorageProvider,
  StorageBucket,
  UploadOptions,
  UploadResult,
  StorageFileInfo,
} from '@template/data'

// Implementações legadas (Supabase direto) — @deprecated, remover no Sprint 7
export {
  /** @deprecated Use `getStorageProvider().uploadFile()` de `@/lib/providers` */
  uploadFile,
  /** @deprecated Use `getStorageProvider().getSignedUrl()` de `@/lib/providers` */
  getSignedUrl,
  /** @deprecated Use `getStorageProvider().getPublicUrl()` de `@/lib/providers` */
  getPublicUrl,
  /** @deprecated Use `getStorageProvider().deleteFile()` de `@/lib/providers` */
  deleteFile,
  /** @deprecated Use `getStorageProvider().listFiles()` de `@/lib/providers` */
  listFiles,
} from './supabaseStorage'
