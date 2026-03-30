/**
 * Supabase Storage Wrapper
 *
 * Replaces custom file upload endpoint with Supabase Storage.
 * Supports: upload, download, list, delete, get public URLs.
 *
 * Default buckets: avatars, attachments, public
 */
import { supabase } from '../supabase/client'

export type StorageBucket = 'avatars' | 'attachments' | 'public'

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

/**
 * Upload a file to Supabase Storage.
 */
export async function uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
  const bucket = options.bucket || 'attachments'
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = options.path || `${timestamp}-${safeName}`

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: options.upsert ?? false,
    contentType: options.contentType || file.type,
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

/**
 * Get a signed URL for a private file.
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error) return null
  return data.signedUrl
}

/**
 * Get a public URL for a file in the public bucket.
 */
export function getPublicUrl(path: string): string {
  return supabase.storage.from('public').getPublicUrl(path).data.publicUrl
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(
  bucket: StorageBucket,
  paths: string[]
): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(bucket).remove(paths)
  return { error: error?.message ?? null }
}

/**
 * List files in a bucket/folder.
 */
export async function listFiles(
  bucket: StorageBucket,
  folder?: string
): Promise<{ name: string; size: number; created_at: string }[]> {
  const { data, error } = await supabase.storage.from(bucket).list(folder)
  if (error || !data) return []
  return data.map(f => ({
    name: f.name,
    size: ((f.metadata as Record<string, unknown>)?.size as number) || 0,
    created_at: f.created_at || '',
  }))
}
