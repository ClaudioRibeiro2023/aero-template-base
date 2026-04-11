/**
 * SupabaseStorageProvider — implementação de IStorageProvider para Supabase Storage.
 *
 * Wraps o código existente de `@template/shared/storage` atrás da interface
 * agnóstica. Para trocar para S3: criar S3StorageProvider implementando IStorageProvider.
 */
import { createBrowserClient } from '@supabase/ssr'
import type {
  IStorageProvider,
  StorageBucket,
  UploadOptions,
  UploadResult,
  StorageFileInfo,
} from '../../interfaces/IStorageProvider'

export class SupabaseStorageProvider implements IStorageProvider {
  private getClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('[SupabaseStorageProvider] Variáveis SUPABASE não configuradas.')
    }
    return createBrowserClient(url, key)
  }

  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const supabase = this.getClient()
    const bucket = (options.bucket ?? 'attachments') as string
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = options.path ?? `${timestamp}-${safeName}`

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: options.upsert ?? false,
      contentType: options.contentType ?? file.type,
    })

    if (error) {
      return { path: '', publicUrl: null, error: error.message }
    }

    const publicUrl =
      bucket === 'public'
        ? supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl
        : null

    return { path: data.path, publicUrl, error: null }
  }

  async getSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase.storage
      .from(bucket as string)
      .createSignedUrl(path, expiresIn)
    if (error) return null
    return data.signedUrl
  }

  getPublicUrl(path: string): string {
    const supabase = this.getClient()
    return supabase.storage.from('public').getPublicUrl(path).data.publicUrl
  }

  async deleteFile(bucket: StorageBucket, paths: string[]): Promise<{ error: string | null }> {
    const supabase = this.getClient()
    const { error } = await supabase.storage.from(bucket as string).remove(paths)
    return { error: error?.message ?? null }
  }

  async listFiles(bucket: StorageBucket, folder?: string): Promise<StorageFileInfo[]> {
    const supabase = this.getClient()
    const { data, error } = await supabase.storage.from(bucket as string).list(folder)
    if (error || !data) return []
    return data.map(f => ({
      name: f.name,
      size: ((f.metadata as Record<string, unknown>)?.size as number) || 0,
      created_at: f.created_at ?? '',
    }))
  }
}
