/**
 * IStorageProvider — interface agnóstica de provider para armazenamento de arquivos.
 *
 * Implementações concretas: SupabaseStorageProvider, S3StorageProvider, etc.
 */

export type StorageBucket = 'avatars' | 'attachments' | 'public' | string

export interface UploadOptions {
  bucket?: StorageBucket
  path?: string
  upsert?: boolean
  contentType?: string
}

export interface UploadResult {
  path: string
  publicUrl: string | null
  error: string | null
}

export interface StorageFileInfo {
  name: string
  size: number
  created_at: string
}

export interface IStorageProvider {
  /**
   * Faz upload de um arquivo.
   */
  uploadFile(file: File, options?: UploadOptions): Promise<UploadResult>

  /**
   * Gera URL assinada para acesso temporário a arquivo privado.
   * @param expiresIn segundos até expiração (default: 3600)
   */
  getSignedUrl(bucket: StorageBucket, path: string, expiresIn?: number): Promise<string | null>

  /**
   * Retorna URL pública de arquivo no bucket público.
   */
  getPublicUrl(path: string): string

  /**
   * Remove arquivos de um bucket.
   */
  deleteFile(bucket: StorageBucket, paths: string[]): Promise<{ error: string | null }>

  /**
   * Lista arquivos em um bucket/pasta.
   */
  listFiles(bucket: StorageBucket, folder?: string): Promise<StorageFileInfo[]>
}
