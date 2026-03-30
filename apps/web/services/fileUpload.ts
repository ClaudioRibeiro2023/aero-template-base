import { env } from '@/lib/env'
/**
 * File Upload Service — Sprint 36
 * Connects to /api/v1/files endpoints (file_upload router).
 */
import axios from 'axios'

const BASE_URL = env.API_URL || 'http://localhost:8000'

const fileClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 60000, // 60s for uploads
})

// Attach auth token
fileClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ============================================================================
// Types
// ============================================================================

export interface FileMetadata {
  id: string
  filename: string
  content_type: string
  size: number
  uploaded_at: string
  uploaded_by: string | null
  tags: string[]
}

export interface FileListResponse {
  items: FileMetadata[]
  total: number
}

export interface PresignedUrlResponse {
  upload_url: string
  file_id: string
  expires_in: number
}

export interface UploadOptions {
  tags?: string[]
  uploadedBy?: string
  onProgress?: (percent: number) => void
}

export interface ListFilesParams {
  page?: number
  limit?: number
  tag?: string
}

// ============================================================================
// Service
// ============================================================================

export const fileUploadService = {
  async upload(file: File, options: UploadOptions = {}): Promise<FileMetadata> {
    const formData = new FormData()
    formData.append('file', file)
    if (options.tags?.length) {
      formData.append('tags', options.tags.join(','))
    }
    if (options.uploadedBy) {
      formData.append('uploaded_by', options.uploadedBy)
    }

    const { data } = await fileClient.post<FileMetadata>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (options.onProgress && e.total) {
          options.onProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    })
    return data
  },

  async getMetadata(fileId: string): Promise<FileMetadata> {
    const { data } = await fileClient.get<FileMetadata>(`/files/${fileId}`)
    return data
  },

  async list(params: ListFilesParams = {}): Promise<FileListResponse> {
    const { data } = await fileClient.get<FileListResponse>('/files', { params })
    return data
  },

  async delete(fileId: string): Promise<void> {
    await fileClient.delete(`/files/${fileId}`)
  },

  async getPresignedUrl(filename: string, contentType?: string): Promise<PresignedUrlResponse> {
    const { data } = await fileClient.post<PresignedUrlResponse>('/files/presigned', {
      filename,
      content_type: contentType || 'application/octet-stream',
    })
    return data
  },
}
