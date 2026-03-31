/**
 * File Upload Service — Supabase Storage
 * Manages file uploads via Supabase Storage buckets.
 */

// ============================================================================
// Types
// ============================================================================

export interface FileMetadata {
  id: string
  name: string
  content_type: string
  size: number
  created_at: string
  updated_at: string
  bucket_id: string
  path: string
}

export interface UploadOptions {
  bucket?: string
  folder?: string
  upsert?: boolean
}

export interface ListFilesParams {
  bucket?: string
  folder?: string
  limit?: number
  offset?: number
}

// ============================================================================
// Service
// ============================================================================

const DEFAULT_BUCKET = 'attachments'

export const fileUploadService = {
  async upload(file: File, options: UploadOptions = {}): Promise<FileMetadata> {
    const { supabase } = await import('@template/shared/supabase')
    const bucket = options.bucket || DEFAULT_BUCKET
    const folder = options.folder || ''
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = folder ? `${folder}/${timestamp}-${safeName}` : `${timestamp}-${safeName}`

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: options.upsert ?? false,
      contentType: file.type,
    })

    if (error) throw new Error(`Upload failed: ${error.message}`)

    return {
      id: data.id ?? data.path,
      name: file.name,
      content_type: file.type,
      size: file.size,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bucket_id: bucket,
      path: data.path,
    }
  },

  async getPublicUrl(path: string, bucket = DEFAULT_BUCKET): Promise<string> {
    const { supabase } = await import('@template/shared/supabase')
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },

  async getSignedUrl(path: string, expiresIn = 3600, bucket = DEFAULT_BUCKET): Promise<string> {
    const { supabase } = await import('@template/shared/supabase')
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
    if (error) throw new Error(`Signed URL failed: ${error.message}`)
    return data.signedUrl
  },

  async list(params: ListFilesParams = {}): Promise<FileMetadata[]> {
    const { supabase } = await import('@template/shared/supabase')
    const bucket = params.bucket || DEFAULT_BUCKET
    const { data, error } = await supabase.storage.from(bucket).list(params.folder || '', {
      limit: params.limit || 100,
      offset: params.offset || 0,
      sortBy: { column: 'created_at', order: 'desc' },
    })
    if (error) throw new Error(`List files failed: ${error.message}`)
    return (data || []).map(f => ({
      id: f.id ?? f.name,
      name: f.name,
      content_type: f.metadata?.mimetype || 'application/octet-stream',
      size: f.metadata?.size || 0,
      created_at: f.created_at || '',
      updated_at: f.updated_at || '',
      bucket_id: bucket,
      path: params.folder ? `${params.folder}/${f.name}` : f.name,
    }))
  },

  async delete(path: string, bucket = DEFAULT_BUCKET): Promise<void> {
    const { supabase } = await import('@template/shared/supabase')
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) throw new Error(`Delete failed: ${error.message}`)
  },
}
